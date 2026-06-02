#!/usr/bin/env python3
"""
Analiza el ultimo commit y genera titulo + descripcion ADF para Jira.
Uso: python jira-build-description.py
Salida: JSON { "title": "...", "description": {...ADF...} }
"""

import subprocess, json, sys, re, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

def run(cmd):
    try:
        return subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.DEVNULL).strip()
    except:
        return ""

# ── Info del commit ──────────────────────────────────────────────
commit_msg   = run("git log -1 --pretty=%s")
commit_hash  = run("git log -1 --pretty=%H")[:8]
branch       = run("git rev-parse --abbrev-ref HEAD")
author       = run("git log -1 --pretty=%an")
date         = run("git log -1 --pretty=%ci").split(" ")[0]

# ── Archivos cambiados ───────────────────────────────────────────
raw_files = run("git show --name-status --pretty= HEAD")
files = []
for line in raw_files.splitlines():
    parts = line.split("\t")
    if len(parts) >= 2:
        status_map = {"M": "Modificado", "A": "Agregado", "D": "Eliminado", "R": "Renombrado"}
        status = status_map.get(parts[0][0], parts[0])
        files.append({"status": status, "path": parts[-1]})

# ── Stats ────────────────────────────────────────────────────────
stat = run("git show --shortstat --pretty= HEAD | tail -1")

# ── Funciones / componentes tocados ─────────────────────────────
diff = run("git show HEAD")
symbols = []
for line in diff.splitlines():
    if not line.startswith("+") or line.startswith("+++"):
        continue
    clean = line[1:].strip()
    if re.match(r"(export\s+)?(const|function|class|async function)\s+[A-Z][a-zA-Z]", clean):
        name = re.sub(r"\s*[={(<].*", "", clean).strip()
        if name and name not in symbols:
            symbols.append(name)
    if re.match(r"(export\s+)?(const\s+[a-z][a-zA-Z]+\s*=\s*(async\s+)?\(|const\s+[a-z][a-zA-Z]+\s*=\s*\()", clean):
        name = re.sub(r"\s*=.*", "", clean).replace("export", "").replace("const", "").strip()
        if name and name not in symbols:
            symbols.append(name)

symbols = [s for s in symbols if len(s) > 2][:10]

# ── Titulo descriptivo ───────────────────────────────────────────
prefixes = [
    (r"^feat",          "Nueva funcion"),
    (r"^fix",           "Correccion"),
    (r"^refactor",      "Refactor"),
    (r"^style|^ui|^ux", "UI/UX"),
    (r"^perf",          "Performance"),
    (r"^docs",          "Docs"),
    (r"^chore",         "Chore"),
    (r"^test",          "Tests"),
]
prefix = "Cambio"
for pattern, label in prefixes:
    if re.match(pattern, commit_msg, re.IGNORECASE):
        prefix = label
        break

# Extraer descripcion limpia del mensaje (quitar prefijo tipo "feat(x):")
clean_msg = re.sub(r"^[a-z]+(\([^)]+\))?:\s*", "", commit_msg, flags=re.IGNORECASE)
title = f"{prefix}: {clean_msg}" if clean_msg else f"{prefix}: {commit_msg}"

# ── Construir ADF ────────────────────────────────────────────────
def heading(text, level=3):
    return {"type": "heading", "attrs": {"level": level},
            "content": [{"type": "text", "text": text}]}

def paragraph(*parts):
    content = []
    for p in parts:
        if isinstance(p, str):
            content.append({"type": "text", "text": p})
        else:
            content.append(p)
    return {"type": "paragraph", "content": content}

def code_text(text):
    return {"type": "text", "text": text, "marks": [{"type": "code"}]}

def bullet_list(items):
    return {"type": "bulletList", "content": [
        {"type": "listItem", "content": [paragraph(i)]} for i in items if i
    ]}

adf_content = []

# Bloque: info del commit
adf_content.append(heading("Commit"))
adf_content.append(paragraph(
    f"Hash: {commit_hash}  |  Branch: {branch}  |  Autor: {author}  |  Fecha: {date}"
))

# Bloque: archivos
if files:
    adf_content.append(heading("Archivos modificados"))
    file_items = [f"[{f['status']}] {f['path']}" for f in files]
    adf_content.append(bullet_list(file_items))

# Bloque: stats
if stat:
    adf_content.append(paragraph(f"Estadisticas: {stat}"))

# Bloque: funciones/componentes
if symbols:
    adf_content.append(heading("Funciones y componentes"))
    adf_content.append(bullet_list(symbols))

description = {"type": "doc", "version": 1, "content": adf_content}

print(json.dumps({"title": title, "description": description}, ensure_ascii=False))
