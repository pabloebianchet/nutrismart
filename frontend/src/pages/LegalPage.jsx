import { Box, Typography, Container, Paper, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

const C = { brand: "#bae0dc", surface: "#F7F9F8", border: "rgba(11,94,85,0.12)", text: "#0F2420", muted: "#4A6B67", faint: "#8AADAA" };

const Section = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#2a6e67", mb: 1.5 }}>{title}</Typography>
    <Box>{children}</Box>
  </Box>
);
const P = ({ children }) => <Typography sx={{ fontSize: 14, color: C.muted, lineHeight: 1.85, mb: 1.5 }}>{children}</Typography>;
const Li = ({ children }) => <Typography component="li" sx={{ fontSize: 14, color: C.muted, lineHeight: 1.85, mb: 0.5, ml: 2 }}>{children}</Typography>;

const CookieRow = ({ name, type, purpose, duration }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1.5fr 1fr 3fr 1fr" }, gap: 1, py: 1.5, borderBottom: `1px solid ${C.border}`, "&:last-child": { borderBottom: "none" } }}>
    <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.text }}>{name}</Typography>
    <Box sx={{ display: "inline-flex", alignSelf: "start", px: 1.2, py: 0.3, borderRadius: 99, bgcolor: type === "Esencial" ? "#E6F5F3" : "#FFF3E0", border: `1px solid ${type === "Esencial" ? "rgba(11,94,85,0.2)" : "rgba(230,81,0,0.2)"}` }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: type === "Esencial" ? C.brand : "#E65100" }}>{type}</Typography>
    </Box>
    <Typography sx={{ fontSize: 13, color: C.muted }}>{purpose}</Typography>
    <Typography sx={{ fontSize: 12, color: C.faint }}>{duration}</Typography>
  </Box>
);

export default function LegalPage() {
  const navigate = useNavigate();
  const updated = "Mayo 2025";

  return (
    <Box sx={{ background: C.surface, minHeight: "100vh", py: 6 }}>
      <Container maxWidth="md">

        <Box sx={{ mb: 5 }}>
          <Typography
            onClick={() => navigate("/")}
            sx={{ fontSize: 13, color: "#2a6e67", fontWeight: 700, cursor: "pointer", mb: 2, "&:hover": { textDecoration: "underline" } }}
          >
            ← Volver a Nui
          </Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: "-0.8px", mb: 1 }}>
            Aviso Legal y Política de Cookies
          </Typography>
          <Typography sx={{ fontSize: 13, color: C.faint }}>Última actualización: {updated}</Typography>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, p: { xs: 3, md: 5 }, mb: 4 }}>

          {/* AVISO LEGAL */}
          <Typography sx={{ fontSize: 20, fontWeight: 900, color: C.text, mb: 3, letterSpacing: "-0.4px" }}>
            Aviso Legal
          </Typography>

          <Section title="1. Identificación del titular">
            <P>
              De conformidad con el deber de información establecido por la normativa argentina,
              se pone en conocimiento de los usuarios la siguiente información sobre el titular del servicio:
            </P>
            <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: "#E6F5F3", border: `1px solid rgba(11,94,85,0.15)`, mb: 2 }}>
              <Typography sx={{ fontSize: 14, color: C.muted, lineHeight: 2 }}>
                <strong>Nombre del servicio:</strong> Nui<br />
                <strong>País de operación:</strong> República Argentina<br />
                <strong>Correo de contacto:</strong> info@nuiapp.com<br />
                <strong>Normativa aplicable:</strong> Ley 25.326 (Protección de Datos Personales), Ley 24.240 (Defensa del Consumidor), Ley 26.994 (Código Civil y Comercial)
              </Typography>
            </Box>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="2. Objeto del servicio">
            <P>
              <strong>Nui</strong> es una plataforma digital de análisis nutricional, recetas y entrenamiento
              personalizado mediante inteligencia artificial, dirigida a usuarios en la República Argentina.
            </P>
            <P>
              El contenido generado por Nui tiene carácter <strong>informativo y orientativo</strong>.
              No constituye consejo médico, dietético ni de salud profesional.
              Nui no es un servicio de salud regulado por el Ministerio de Salud de la Nación
              ni por ningún organismo sanitario.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="3. Propiedad intelectual">
            <P>
              La denominación, logotipos, diseño de interfaz, código fuente y metodologías propias de Nui
              están protegidos por la <strong>Ley 11.723 de Propiedad Intelectual</strong>.
              Queda prohibida su reproducción total o parcial sin autorización expresa y por escrito.
            </P>
            <P>
              Los contenidos generados por usuarios (fotografías de etiquetas) permanecen siendo propiedad
              del usuario. Al subirlos al Servicio, el usuario otorga a Nui una licencia no exclusiva,
              limitada y gratuita para procesarlos con el único fin de generar el análisis solicitado.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="4. Limitación de responsabilidad sobre los análisis de IA">
            <P>
              Los análisis nutricionales, planes de entrenamiento y recetas generados por Nui
              son producidos por modelos de inteligencia artificial y pueden contener imprecisiones.
              La información se basa en los datos ingresados por el usuario y en los criterios
              de la clasificación NOVA y guías nutricionales de referencia (OMS, EFSA).
            </P>
            <P>
              <strong>Nui no se responsabiliza por decisiones de salud, alimentación o actividad física
              tomadas exclusivamente en base a los resultados de la plataforma.</strong>
              Siempre se recomienda consultar con nutricionistas, médicos o entrenadores certificados.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="5. Enlace a otras páginas">
            <P>
              Nui puede contener enlaces a sitios web de terceros. No tenemos control sobre el contenido
              de dichos sitios y no asumimos responsabilidad alguna por sus políticas de privacidad
              o prácticas de seguridad.
            </P>
          </Section>

        </Paper>

        {/* POLÍTICA DE COOKIES */}
        <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, p: { xs: 3, md: 5 } }}>

          <Typography sx={{ fontSize: 20, fontWeight: 900, color: C.text, mb: 3, letterSpacing: "-0.4px" }}>
            Política de Cookies
          </Typography>

          <Section title="¿Qué son las cookies?">
            <P>
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita
              un sitio web. Permiten que el sitio recuerde sus preferencias, mantenga su sesión iniciada
              y mejore su experiencia de uso.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="Cookies que utilizamos">
            <P>Nui utiliza únicamente cookies <strong>estrictamente necesarias</strong> para el funcionamiento del servicio:</P>

            {/* Header tabla */}
            <Box sx={{ display: { xs: "none", sm: "grid" }, gridTemplateColumns: "1.5fr 1fr 3fr 1fr", gap: 1, pb: 1, mb: 1, borderBottom: `2px solid ${C.border}` }}>
              {["Cookie", "Tipo", "Finalidad", "Duración"].map(h => (
                <Typography key={h} sx={{ fontSize: 11, fontWeight: 700, color: C.faint, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</Typography>
              ))}
            </Box>

            <CookieRow
              name="nutrismartToken"
              type="Esencial"
              purpose="Almacena el token JWT de autenticación para mantener la sesión iniciada del usuario."
              duration="7 días"
            />
            <CookieRow
              name="nutrismart_training_*"
              type="Esencial"
              purpose="Guarda localmente los planes de entrenamiento activos del usuario para acceso sin conexión."
              duration="Sesión"
            />
            <CookieRow
              name="nutrismart_recipes_*"
              type="Esencial"
              purpose="Almacena preferencias de recetas y últimas búsquedas del módulo Recetas YA."
              duration="Sesión"
            />
            <CookieRow
              name="Google OAuth"
              type="Tercero"
              purpose="Cookies de autenticación de Google utilizadas cuando el usuario inicia sesión con su cuenta Google."
              duration="Según Google"
            />
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="Cookies de terceros">
            <P>
              Al utilizar el inicio de sesión con Google, <strong>Google LLC</strong> puede instalar
              sus propias cookies conforme a su propia política de privacidad, disponible en
              <strong> policies.google.com</strong>.
            </P>
            <P>
              Nui no utiliza cookies de publicidad, remarketing ni seguimiento de comportamiento
              entre sitios web.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="Cómo gestionar las cookies">
            <P>
              Dado que las cookies de Nui son de almacenamiento local (<em>localStorage</em>) y
              técnicamente necesarias para el funcionamiento del servicio, no requieren consentimiento
              separado conforme a la normativa argentina vigente.
            </P>
            <P>
              Si desea eliminar los datos almacenados localmente, puede hacerlo desde la
              configuración de su navegador:
            </P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Borrar datos de navegación.</Li>
              <Li><strong>Firefox:</strong> Configuración → Privacidad y seguridad → Cookies y datos del sitio.</Li>
              <Li><strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos del sitio web.</Li>
              <Li><strong>Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Borrar datos de exploración.</Li>
            </Box>
            <P>
              Tenga en cuenta que eliminar estas cookies cerrará su sesión y eliminará los planes
              de entrenamiento guardados localmente.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="Contacto">
            <P>
              Para consultas sobre esta Política de Cookies o sobre el Aviso Legal,
              puede contactarnos en: <strong>info@nuiapp.com</strong>
            </P>
          </Section>

        </Paper>
      </Container>
    </Box>
  );
}
