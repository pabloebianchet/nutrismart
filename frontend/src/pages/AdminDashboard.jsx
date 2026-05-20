import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import { API_URL } from "../config/api";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

/* ─── Tokens ─────────────────────────────── */
const C = {
  brand: "#0B5E55",
  brandLight: "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9F8",
  border: "rgba(11,94,85,0.10)",
  borderMed: "rgba(11,94,85,0.20)",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
  textMuted: "#8AADAA",
  danger: "#E24B4A",
  dangerSurface: "rgba(226,75,74,0.07)",
  dangerBorder: "rgba(226,75,74,0.20)",
};

const shadow = {
  sm: "0 1px 3px rgba(11,94,85,0.07), 0 1px 2px rgba(11,94,85,0.04)",
  md: "0 4px 14px rgba(11,94,85,0.09), 0 2px 4px rgba(11,94,85,0.05)",
  lg: "0 12px 32px rgba(11,94,85,0.11), 0 4px 8px rgba(11,94,85,0.06)",
};

/* ─── KPI Card ───────────────────────────── */
const KpiCard = ({ label, value, icon: Icon, accent, trend }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 4,
      border: `1px solid ${accent ? C.brandMuted : C.border}`,
      bgcolor: accent ? C.brandSurface : C.surface,
      boxShadow: shadow.md,
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
      position: "relative",
      overflow: "hidden",
      transition: "box-shadow 0.2s",
      "&:hover": { boxShadow: shadow.lg },
    }}
  >
    {/* Fondo decorativo */}
    <Box
      sx={{
        position: "absolute",
        right: -16,
        top: -16,
        width: 72,
        height: 72,
        borderRadius: "50%",
        bgcolor: accent ? "rgba(11,94,85,0.08)" : "rgba(11,94,85,0.04)",
        pointerEvents: "none",
      }}
    />

    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2.5,
          bgcolor: accent ? C.brand : "rgba(11,94,85,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 20, color: accent ? "#fff" : C.brand }} />
      </Box>

      {trend !== undefined && (
        <Chip
          label={`+${trend} hoy`}
          size="small"
          sx={{
            bgcolor: "rgba(59,158,106,0.12)",
            color: "#3B9E6A",
            fontWeight: 700,
            fontSize: 11,
            height: 22,
            border: "none",
          }}
        />
      )}
    </Stack>

    <Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          mb: 0.4,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 36,
          fontWeight: 900,
          color: accent ? C.brand : C.textPrimary,
          lineHeight: 1,
        }}
      >
        {value ?? "—"}
      </Typography>
    </Box>
  </Paper>
);

/* ─── AdminDashboard ─────────────────────── */
const AdminDashboard = () => {
  const { user } = useNutrition();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("nutrismartToken");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchAdminData = async () => {
      try {
        const statsRes = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statsRes.status === 403) {
          navigate("/");
          return;
        }
        setStats(await statsRes.json());

        const usersRes = await fetch(`${API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      } catch (err) {
        console.error("Admin fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user, token, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    setDeletingId(id);
    try {
      await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase())),
    [users, search],
  );

  /* Iniciales para el avatar */
  const getInitials = (email = "") => email.slice(0, 2).toUpperCase();

  const columns = [
    {
      field: "email",
      headerName: "Usuario",
      flex: 1.8,
      renderCell: (params) => (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ py: 0.5 }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: 12,
              fontWeight: 700,
              bgcolor: C.brandSurface,
              color: C.brand,
              border: `1px solid ${C.brandMuted}`,
            }}
          >
            {getInitials(params.value)}
          </Avatar>
          <Typography
            sx={{ fontSize: 13, color: C.textPrimary, fontWeight: 500 }}
          >
            {params.value}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "edad",
      headerName: "Edad",
      width: 80,
      renderCell: (params) => (
        <Typography
          sx={{
            fontSize: 13,
            color: params.value ? C.textPrimary : C.textMuted,
          }}
        >
          {params.value ? `${params.value} a` : "—"}
        </Typography>
      ),
    },
    {
      field: "altura",
      headerName: "Altura",
      width: 90,
      renderCell: (params) => (
        <Typography
          sx={{
            fontSize: 13,
            color: params.value ? C.textPrimary : C.textMuted,
          }}
        >
          {params.value ? `${params.value} cm` : "—"}
        </Typography>
      ),
    },
    {
      field: "peso",
      headerName: "Peso",
      width: 90,
      renderCell: (params) => (
        <Typography
          sx={{
            fontSize: 13,
            color: params.value ? C.textPrimary : C.textMuted,
          }}
        >
          {params.value ? `${params.value} kg` : "—"}
        </Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: "Registro",
      flex: 1,
      valueGetter: (value) =>
        value
          ? new Date(value).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 12, color: C.textSecondary }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          disabled={deletingId === params.row._id}
          onClick={() => handleDelete(params.row._id)}
          sx={{
            color: C.textMuted,
            borderRadius: 2,
            transition: "all 0.15s",
            "&:hover": {
              color: C.danger,
              bgcolor: C.dangerSurface,
            },
          }}
        >
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: `3px solid ${C.brandMuted}`,
            borderTopColor: C.brand,
            animation: "spin 0.8s linear infinite",
            "@keyframes spin": { to: { transform: "rotate(360deg)" } },
          }}
        />
        <Typography sx={{ color: C.textMuted, fontSize: 14 }}>
          Cargando datos de administración…
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: C.surfaceAlt,
        px: { xs: 2, sm: 3, md: 5 },
        py: { xs: 3, md: 5 },
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      {/* ── HEADER ──────────────────────────────── */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={5}
        gap={2}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: C.brand,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: shadow.md,
            }}
          >
            <AdminPanelSettingsOutlinedIcon
              sx={{ fontSize: 24, color: "#fff" }}
            />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                color: C.textMuted,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                mb: 0.2,
              }}
            >
              NutriSmart
            </Typography>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 900,
                color: C.textPrimary,
                lineHeight: 1.2,
              }}
            >
              Administración
            </Typography>
          </Box>
        </Stack>

        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/dashboard")}
          sx={{
            textTransform: "none",
            color: C.textSecondary,
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 999,
            px: 2.5,
            border: `1px solid ${C.border}`,
            bgcolor: C.surface,
            boxShadow: shadow.sm,
            "&:hover": {
              bgcolor: C.brandSurface,
              borderColor: C.brandMuted,
              color: C.brand,
            },
          }}
        >
          Volver al panel
        </Button>
      </Stack>

      {/* ── KPI CARDS ───────────────────────────── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2.5,
          mb: 5,
        }}
      >
        <KpiCard
          label="Usuarios totales"
          value={stats?.totalUsers}
          icon={PeopleAltOutlinedIcon}
          accent
        />
        <KpiCard
          label="Nuevos hoy"
          value={stats?.newUsersToday}
          icon={PersonAddAltOutlinedIcon}
          trend={stats?.newUsersToday}
        />
        <KpiCard
          label="Análisis hoy"
          value={stats?.analysesToday}
          icon={AnalyticsOutlinedIcon}
          trend={stats?.analysesToday}
        />
      </Box>

      {/* ── TABLA DE USUARIOS ───────────────────── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 5,
          border: `1px solid ${C.border}`,
          boxShadow: shadow.md,
          overflow: "hidden",
          bgcolor: C.surface,
        }}
      >
        {/* Tabla header */}
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            py: 2.5,
            borderBottom: `1px solid ${C.border}`,
            bgcolor: C.surfaceAlt,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2.5,
                bgcolor: C.brandSurface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PeopleAltOutlinedIcon sx={{ fontSize: 18, color: C.brand }} />
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}
              >
                Usuarios registrados
              </Typography>
              <Typography sx={{ fontSize: 12, color: C.textMuted }}>
                {filteredUsers.length} resultado
                {filteredUsers.length !== 1 ? "s" : ""}
                {search && ` para "${search}"`}
              </Typography>
            </Box>
          </Stack>

          <TextField
            placeholder="Buscar por email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              width: { xs: "100%", sm: 280 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                bgcolor: C.surface,
                fontSize: 13,
                "& fieldset": { borderColor: C.border },
                "&:hover fieldset": { borderColor: C.brandMuted },
                "&.Mui-focused fieldset": {
                  borderColor: C.brand,
                  borderWidth: 1.5,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon
                    sx={{ fontSize: 18, color: C.textMuted }}
                  />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* DataGrid */}
        <Box sx={{ height: 520 }}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            getRowId={(row) => row._id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            disableRowSelectionOnClick
            rowHeight={56}
            sx={{
              border: "none",
              bgcolor: C.surface,
              fontFamily: "inherit",

              /* Header */
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: C.surfaceAlt,
                borderBottom: `1px solid ${C.border}`,
              },
              "& .MuiDataGrid-columnHeader": {
                bgcolor: C.surfaceAlt,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontSize: 11,
                fontWeight: 700,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              },
              "& .MuiDataGrid-columnSeparator": { display: "none" },

              /* Rows */
              "& .MuiDataGrid-row": {
                borderBottom: `1px solid ${C.border}`,
                transition: "background-color 0.15s",
              },
              "& .MuiDataGrid-row:last-child": {
                borderBottom: "none",
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: C.brandSurface,
              },

              /* Cells */
              "& .MuiDataGrid-cell": {
                border: "none",
                outline: "none !important",
                "&:focus": { outline: "none" },
              },

              /* Footer */
              "& .MuiDataGrid-footerContainer": {
                borderTop: `1px solid ${C.border}`,
                bgcolor: C.surfaceAlt,
                minHeight: 48,
              },
              "& .MuiTablePagination-root": {
                fontSize: 13,
                color: C.textSecondary,
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  fontSize: 12,
                  color: C.textMuted,
                },

              /* Scroll */
              "& .MuiDataGrid-scrollbar": {
                "&::-webkit-scrollbar": { width: 6, height: 6 },
                "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: C.brandMuted,
                  borderRadius: 3,
                },
              },
            }}
          />
        </Box>
      </Paper>

      <Box sx={{ height: 40 }} />
    </Box>
  );
};

export default AdminDashboard;
