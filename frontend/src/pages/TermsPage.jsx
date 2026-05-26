import { Box, Typography, Container, Paper, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

const C = { brand: "#0B5E55", surface: "#F7F9F8", border: "rgba(11,94,85,0.12)", text: "#0F2420", muted: "#4A6B67", faint: "#8AADAA" };

const Section = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography sx={{ fontSize: 16, fontWeight: 800, color: C.brand, mb: 1.5 }}>{title}</Typography>
    <Box>{children}</Box>
  </Box>
);
const P = ({ children }) => <Typography sx={{ fontSize: 14, color: C.muted, lineHeight: 1.85, mb: 1.5 }}>{children}</Typography>;
const Li = ({ children }) => <Typography component="li" sx={{ fontSize: 14, color: C.muted, lineHeight: 1.85, mb: 0.5, ml: 2 }}>{children}</Typography>;

export default function TermsPage() {
  const navigate = useNavigate();
  const updated = "Mayo 2025";

  return (
    <Box sx={{ background: C.surface, minHeight: "100vh", py: 6 }}>
      <Container maxWidth="md">

        <Box sx={{ mb: 5 }}>
          <Typography
            onClick={() => navigate("/")}
            sx={{ fontSize: 13, color: C.brand, fontWeight: 700, cursor: "pointer", mb: 2, "&:hover": { textDecoration: "underline" } }}
          >
            ← Volver a Nui
          </Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: "-0.8px", mb: 1 }}>
            Términos y Condiciones
          </Typography>
          <Typography sx={{ fontSize: 13, color: C.faint }}>Última actualización: {updated}</Typography>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, p: { xs: 3, md: 5 } }}>

          <Section title="1. Aceptación de los términos">
            <P>
              Al registrarse, acceder o utilizar el servicio <strong>Nui</strong> (en adelante, "el Servicio"),
              usted acepta quedar vinculado por los presentes Términos y Condiciones, así como por nuestra
              Política de Privacidad. Si no está de acuerdo con alguno de estos términos, le rogamos que
              no utilice el Servicio.
            </P>
            <P>
              El Servicio está destinado a personas mayores de <strong>18 años</strong> o menores con
              supervisión y consentimiento de sus padres o tutores legales.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="2. Descripción del servicio">
            <P>Nui es una plataforma digital que ofrece, mediante inteligencia artificial:</P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li><strong>Análisis nutricional:</strong> evaluación del nivel de procesamiento de alimentos (escala NOVA) y puntaje de 0 a 100 basado en las etiquetas de productos.</Li>
              <Li><strong>Recetas YA:</strong> generación de recetas saludables en función de ingredientes disponibles.</Li>
              <Li><strong>Entrenamiento:</strong> creación de planes de ejercicio personalizados según el perfil del usuario.</Li>
            </Box>
            <P>
              Los resultados generados por Nui tienen carácter <strong>meramente informativo y orientativo</strong>.
              No constituyen diagnóstico médico, tratamiento, consejo nutricional clínico ni prescripción de ningún tipo.
              Siempre consulte con un profesional de la salud habilitado antes de tomar decisiones relacionadas
              con su alimentación, estado físico o salud.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="3. Registro y cuenta de usuario">
            <P>
              Para acceder a las funcionalidades del Servicio es necesario registrarse mediante
              correo electrónico y contraseña, o a través de su cuenta de Google.
              Usted es responsable de mantener la confidencialidad de sus credenciales de acceso
              y de todas las actividades realizadas desde su cuenta.
            </P>
            <P>
              Nos reservamos el derecho de suspender o eliminar cuentas que violen estos Términos,
              realicen usos fraudulentos del Servicio o proporcionen información falsa durante el registro.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="4. Planes y suscripciones">
            <P>Nui ofrece los siguientes planes de acceso:</P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li><strong>Plan Gratuito:</strong> acceso a un máximo de 3 análisis nutricionales de prueba, sin costo.</Li>
              <Li><strong>Plan Silver:</strong> acceso a 1 análisis nutricional por día, más acceso completo a Recetas YA y Entrenamiento. Facturación mensual o anual según la opción elegida.</Li>
              <Li><strong>Plan Gold:</strong> análisis ilimitados diarios, más acceso completo a todos los módulos. Facturación mensual o anual.</Li>
            </Box>
            <P>
              Los pagos se procesan de forma segura a través de <strong>Stripe Inc.</strong>
              Los precios son en pesos argentinos (ARS) y pueden estar sujetos a variaciones.
              Le notificaremos con anticipación ante cualquier cambio de precios.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="5. Política de cancelación y reembolsos">
            <P>
              Puede cancelar su suscripción en cualquier momento desde la sección de configuración de su cuenta.
              La cancelación tendrá efecto al finalizar el período de facturación vigente,
              pudiendo continuar usando el Servicio hasta esa fecha.
            </P>
            <P>
              No se emitirán reembolsos por períodos parciales de suscripción, salvo que
              la Ley de Defensa del Consumidor (Ley 24.240) y sus modificatorias lo requieran expresamente
              en el caso concreto. En caso de error en el cobro o duplicación, le reembolsaremos
              el importe correspondiente dentro de los 10 días hábiles.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="6. Uso aceptable del servicio">
            <P>Al utilizar Nui, usted se compromete a:</P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li>No utilizar el Servicio con fines ilegales o no autorizados.</Li>
              <Li>No intentar acceder a datos de otros usuarios o sistemas del Servicio sin autorización.</Li>
              <Li>No realizar ingeniería inversa, descompilar ni intentar extraer el código fuente de la plataforma.</Li>
              <Li>No introducir virus, malware ni código malicioso de ningún tipo.</Li>
              <Li>No sobrecargar intencionalmente la infraestructura del Servicio.</Li>
              <Li>No reproducir, distribuir ni comercializar contenidos del Servicio sin autorización expresa.</Li>
            </Box>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="7. Propiedad intelectual">
            <P>
              Todo el contenido de Nui, incluyendo pero no limitado a: diseño, logotipos, textos, código fuente,
              gráficos, interfaz de usuario y metodologías de análisis, es propiedad exclusiva de sus titulares
              y está protegido por las leyes de propiedad intelectual argentinas (Ley 11.723) y tratados internacionales.
            </P>
            <P>
              Se le concede una licencia limitada, personal, no exclusiva e intransferible para utilizar
              el Servicio según lo previsto en estos Términos. Esta licencia no implica ninguna cesión
              de derechos de propiedad intelectual.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="8. Limitación de responsabilidad">
            <P>
              En la máxima medida permitida por la legislación argentina aplicable, Nui no será responsable
              por daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad
              de uso del Servicio, incluyendo:
            </P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li>Decisiones tomadas por el usuario en base a los análisis, recetas o planes de entrenamiento generados por la IA.</Li>
              <Li>Interrupciones temporales del servicio por mantenimiento o causas técnicas ajenas a nuestro control.</Li>
              <Li>Imprecisiones en los resultados generados por inteligencia artificial.</Li>
            </Box>
            <P>
              Los derechos de los consumidores establecidos por la <strong>Ley 24.240</strong> y sus modificatorias
              quedan expresamente a salvo y no se ven afectados por esta cláusula.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="9. Modificaciones del servicio">
            <P>
              Nos reservamos el derecho de modificar, suspender o discontinuar el Servicio
              —o cualquier parte de él— en cualquier momento, con o sin previo aviso.
              En caso de cambios sustanciales que afecten derechos adquiridos, le notificaremos
              con al menos <strong>15 días de anticipación</strong> por correo electrónico.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="10. Ley aplicable y jurisdicción">
            <P>
              Los presentes Términos y Condiciones se rigen por las leyes de la <strong>República Argentina</strong>,
              en particular por el Código Civil y Comercial de la Nación (Ley 26.994),
              la Ley de Defensa del Consumidor (Ley 24.240) y sus modificatorias.
            </P>
            <P>
              Para la resolución de cualquier controversia derivada del uso del Servicio,
              las partes se someten a la jurisdicción de los <strong>Tribunales Ordinarios de la
              Ciudad Autónoma de Buenos Aires</strong>, con renuncia expresa a cualquier otro fuero
              que pudiera corresponder, salvo disposición legal imperativa en contrario.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="11. Contacto">
            <P>
              Para consultas sobre estos Términos y Condiciones, puede contactarnos en:
              <br />
              📧 <strong>info@nuiapp.com</strong>
            </P>
          </Section>

          <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: "#FFF8E1", border: "1px solid rgba(245,166,35,0.25)" }}>
            <Typography sx={{ fontSize: 13, color: "#7B5800", fontWeight: 700, mb: 0.5 }}>
              ⚕️ Aviso importante sobre salud
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#5D4200", lineHeight: 1.7 }}>
              Nui es una herramienta de información nutricional y bienestar, no un servicio médico.
              Los análisis, puntajes y planes generados por inteligencia artificial son orientativos.
              Ante cualquier duda sobre su salud, alimentación o condición física, consulte siempre
              con un profesional de la salud habilitado.
            </Typography>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}
