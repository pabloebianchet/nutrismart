import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import { API_URL } from "../config/api";

const AdminDashboard = () => {
  const { user } = useNutrition();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("nutrismartToken");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchAdminData = async () => {
      try {
        const statsRes = await fetch(`${API_URL}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (statsRes.status === 403) {
          navigate("/");
          return;
        }

        const statsData = await statsRes.json();
        setStats(statsData);

        const usersRes = await fetch(`${API_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Panel de Administración
      </Typography>

      {/* STATS */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Usuarios</Typography>
              <Typography variant="h4">{stats?.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Nuevos Hoy</Typography>
              <Typography variant="h4">{stats?.newUsersToday}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Análisis Hoy</Typography>
              <Typography variant="h4">{stats?.analysesToday}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* USERS TABLE */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Edad</TableCell>
            <TableCell>Altura</TableCell>
            <TableCell>Peso</TableCell>
            <TableCell>Fecha Registro</TableCell>
            <TableCell>Acción</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users?.map((u) => (
            <TableRow key={u._id}>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.edad || "-"}</TableCell>
              <TableCell>{u.altura || "-"}</TableCell>
              <TableCell>{u.peso || "-"}</TableCell>
              <TableCell>
                {new Date(u.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDelete(u._id)}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default AdminDashboard;
