import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import { API_URL } from "../config/api";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import IconButton from "@mui/material/IconButton";

const AdminDashboard = () => {
  const { user } = useNutrition();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

        const statsData = await statsRes.json();
        setStats(statsData);

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

  try {
    await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 🔥 actualizar tabla
    setUsers((prev) => prev.filter((u) => u._id !== id));

    // 🔥 actualizar métricas
    setStats((prev) => ({
      ...prev,
      totalUsers: prev.totalUsers - 1,
    }));

  } catch (err) {
    console.error("Delete error:", err);
  }
};

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  const columns = [
    { field: "email", headerName: "Email", flex: 1.4 },
    { field: "edad", headerName: "Edad", width: 90 },
    { field: "altura", headerName: "Altura", width: 100 },
    { field: "peso", headerName: "Peso", width: 100 },
    {
  field: "createdAt",
  headerName: "Registro",
  flex: 1,
  valueGetter: (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString();
  },
},

{
  field: "actions",
  headerName: "",
  width: 70,
  sortable: false,
  filterable: false,
  renderCell: (params) => (
    <IconButton
      onClick={() => handleDelete(params.row._id)}
      sx={{
        color: "#d32f2f",
        "&:hover": { backgroundColor: "rgba(211,47,47,0.08)" },
      }}
    >
      <DeleteOutlineRoundedIcon />
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
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: "auto",
        px: { xs: 2, md: 5 },
        py: 5,
      }}
    >
      {/* HEADER */}
      <Box mb={6}>
        <Typography variant="h4" fontWeight={800}>
          Panel de Administración
        </Typography>
        <Typography color="text.secondary" mt={1}>
          Métricas generales y gestión de usuarios.
        </Typography>
      </Box>

      {/* KPI CARDS */}
      <Grid container spacing={3} mb={6}>
        {[
          ["Usuarios Totales", stats?.totalUsers],
          ["Nuevos Hoy", stats?.newUsersToday],
          ["Análisis Hoy", stats?.analysesToday],
        ].map(([label, value]) => (
          <Grid item xs={12} sm={6} md={4} key={label}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                height: 140,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CardContent>
                <Typography color="text.secondary" mb={1}>
                  {label}
                </Typography>
                <Typography variant="h3" fontWeight={800}>
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* USERS TABLE */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Usuarios
        </Typography>

        <TextField
          fullWidth
          placeholder="Buscar por email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Box
          sx={{
            height: 500,
            backgroundColor: "#fff",
            borderRadius: 4,
            boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
          }}
        >
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            getRowId={(row) => row._id}
            pageSizeOptions={[5, 10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            disableRowSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f7f9fb",
                fontWeight: 600,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;