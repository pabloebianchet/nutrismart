import { Box, Typography, Container, Paper, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

const C = { brand: "#0B5E55", surface: "#F7F9F8", border: "rgba(11,94,85,0.12)", text: "#0F2420", muted: "#4A6B67", faint: "#8AADAA" };

const Section = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography sx={{ fontSize: 16, fontWeight: 800, color: C.brand, mb: 1.5, letterSpacing: "-0.2px" }}>{title}</Typography>
    <Box sx={{ fontSize: 14, color: C.muted, lineHeight: 1.85 }}>{children}</Box>
  </Box>
);

const P = ({ children }) => <Typography sx={{ fontSize: 14, color: C.muted, lineHeight: 1.85, mb: 1.5 }}>{children}</Typography>;
const Li = ({ children }) => <Typography component="li" sx={{ fontSize: 14, color: C.muted, lineHeight: 1.85, mb: 0.5, ml: 2 }}>{children}</Typography>;

export default function PrivacyPage() {
  const navigate = useNavigate();
  const updated = "Mayo 2025";

  return (
    <Box sx={{ background: C.surface, minHeight: "100vh", py: 6 }}>
      <Container maxWidth="md">

        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography
            onClick={() => navigate("/")}
            sx={{ fontSize: 13, color: C.brand, fontWeight: 700, cursor: "pointer", mb: 2, "&:hover": { textDecoration: "underline" } }}
          >
            ← Volver a Nui
          </Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: "-0.8px", mb: 1 }}>
            Política de Privacidad
          </Typography>
          <Typography sx={{ fontSize: 13, color: C.faint }}>Última actualización: {updated}</Typography>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, p: { xs: 3, md: 5 } }}>

          <Section title="1. Responsable del tratamiento">
            <P>
              El responsable del tratamiento de sus datos personales es el titular del servicio <strong>Nui</strong>,
              con domicilio en la República Argentina. Para cualquier consulta relacionada con el tratamiento
              de sus datos personales puede contactarnos a través de: <strong>info@nuiapp.com</strong>
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="2. Datos personales que recopilamos">
            <P>En el marco de la prestación del servicio Nui, recopilamos las siguientes categorías de datos:</P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li><strong>Datos de identificación:</strong> nombre completo y dirección de correo electrónico.</Li>
              <Li><strong>Datos de salud (datos sensibles):</strong> sexo biológico, edad, peso, altura y nivel de actividad física. Conforme al artículo 2 de la Ley 25.326, estos datos son considerados <em>datos sensibles</em> y su tratamiento está sujeto a protecciones especiales.</Li>
              <Li><strong>Historial de análisis nutricionales:</strong> texto de etiquetas de productos analizados, puntajes obtenidos y fecha de análisis.</Li>
              <Li><strong>Datos de uso:</strong> planes de entrenamiento generados, sesiones completadas y puntos saludables acumulados.</Li>
              <Li><strong>Datos de pago:</strong> procesados exclusivamente por Stripe Inc. Nui no almacena datos de tarjetas de crédito o débito.</Li>
              <Li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador y cookies de sesión.</Li>
            </Box>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="3. Finalidad del tratamiento">
            <P>Los datos recopilados se utilizan exclusivamente para las siguientes finalidades:</P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li>Prestar el servicio de análisis nutricional con inteligencia artificial personalizado a su perfil.</Li>
              <Li>Generar planes de entrenamiento personalizados.</Li>
              <Li>Sugerir recetas saludables en función de sus preferencias.</Li>
              <Li>Calcular y mostrar su índice de masa corporal (IMC) y métricas de salud orientativas.</Li>
              <Li>Gestionar su cuenta, suscripción y pagos.</Li>
              <Li>Enviar comunicaciones de servicio y notificaciones relacionadas con su actividad en la plataforma (configurable desde su perfil).</Li>
              <Li>Cumplir con obligaciones legales aplicables.</Li>
            </Box>
            <P>
              <strong>Nui no utiliza sus datos personales con fines publicitarios ni los cede a terceros con fines comerciales.</strong>
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="4. Base legal del tratamiento">
            <P>
              El tratamiento de sus datos se funda en el <strong>consentimiento expreso</strong> que usted otorga
              al registrarse en la plataforma y aceptar los presentes términos, conforme al artículo 5 de la Ley 25.326.
              Para los datos sensibles de salud, el consentimiento es <strong>libre, expreso e informado</strong>,
              tal como exige el artículo 7 de la misma ley.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="5. Transferencias internacionales de datos">
            <P>
              Para la prestación del servicio, Nui utiliza proveedores tecnológicos ubicados fuera de la República Argentina.
              En virtud del artículo 12 de la Ley 25.326, le informamos:
            </P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li><strong>OpenAI L.L.C. (Estados Unidos):</strong> procesamiento del texto de etiquetas nutricionales y generación de análisis y planes de entrenamiento mediante inteligencia artificial.</Li>
              <Li><strong>Google LLC (Estados Unidos):</strong> autenticación de usuarios mediante Google OAuth y procesamiento de imágenes mediante Google Cloud Vision API.</Li>
              <Li><strong>Stripe Inc. (Estados Unidos):</strong> procesamiento de pagos y gestión de suscripciones.</Li>
              <Li><strong>MongoDB Atlas / MongoDB Inc. (Estados Unidos):</strong> almacenamiento de datos de usuarios en servidores en la nube.</Li>
            </Box>
            <P>
              Estas transferencias se realizan con proveedores que cuentan con marcos contractuales de protección de datos
              (Standard Contractual Clauses y marcos equivalentes). Al utilizar Nui, usted consiente expresamente
              estas transferencias internacionales.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="6. Plazo de conservación de datos">
            <P>
              Sus datos personales se conservarán mientras mantenga una cuenta activa en Nui.
              Una vez que solicite la eliminación de su cuenta, procederemos a eliminar o anonimizar
              sus datos en un plazo máximo de <strong>30 días hábiles</strong>, salvo que exista
              obligación legal de conservarlos por un período mayor (por ejemplo, datos de facturación).
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="7. Sus derechos (ARCO)">
            <P>
              Conforme a la Ley 25.326 y su Decreto Reglamentario 1558/2001, usted tiene derecho a:
            </P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li><strong>Acceso:</strong> conocer qué datos personales suyos poseemos y cómo los tratamos.</Li>
              <Li><strong>Rectificación:</strong> corregir datos inexactos, incompletos o desactualizados.</Li>
              <Li><strong>Cancelación (supresión):</strong> solicitar la eliminación de sus datos cuando ya no sean necesarios para la finalidad para la que fueron recabados.</Li>
              <Li><strong>Oposición:</strong> oponerse al tratamiento de sus datos en determinadas circunstancias.</Li>
            </Box>
            <P>
              Para ejercer cualquiera de estos derechos, envíe una solicitud a <strong>info@nuiapp.com</strong> indicando
              su nombre completo, correo electrónico registrado y el derecho que desea ejercer.
              Responderemos en un plazo máximo de <strong>5 días hábiles</strong>.
            </P>
            <P>
              Si considera que sus derechos no han sido debidamente atendidos, puede presentar
              una reclamación ante la <strong>Dirección Nacional de Protección de Datos Personales (DNPDP)</strong>,
              organismo de control en la materia, con sede en Sarmiento 1118 Piso 5°, Ciudad Autónoma de Buenos Aires.
              Sitio web: <strong>www.argentina.gob.ar/aaip/datospersonales</strong>
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="8. Seguridad de los datos">
            <P>
              Implementamos medidas técnicas y organizativas razonables para proteger sus datos personales
              frente a accesos no autorizados, pérdida, alteración o divulgación. Entre ellas:
            </P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li>Cifrado de contraseñas mediante algoritmos de hash seguros (bcrypt).</Li>
              <Li>Comunicaciones cifradas mediante HTTPS/TLS.</Li>
              <Li>Autenticación mediante tokens JWT con expiración.</Li>
              <Li>Acceso restringido a los datos por parte del personal autorizado.</Li>
            </Box>
            <P>
              No obstante, ningún sistema de transmisión o almacenamiento de datos es completamente seguro.
              En caso de detectar una brecha de seguridad que afecte sus datos, se lo notificaremos
              conforme a la normativa vigente.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="9. Cookies">
            <P>
              Nui utiliza cookies y tecnologías similares para el funcionamiento de la plataforma.
              Para información detallada, consulte nuestra{" "}
              <Typography
                component="span"
                onClick={() => navigate("/legal")}
                sx={{ color: C.brand, fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
              >
                Política de Cookies
              </Typography>.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="10. Modificaciones">
            <P>
              Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento.
              Cuando realicemos cambios sustanciales, le notificaremos por correo electrónico o mediante
              un aviso destacado en la plataforma. Le recomendamos revisar esta política periódicamente.
            </P>
          </Section>

          <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: "#E6F5F3", border: `1px solid rgba(11,94,85,0.15)` }}>
            <Typography sx={{ fontSize: 13, color: C.brand, fontWeight: 700, mb: 0.5 }}>
              🔒 Compromiso con su privacidad
            </Typography>
            <Typography sx={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
              En Nui tratamos datos de salud, que son datos especialmente sensibles.
              Nuestro compromiso es utilizar esa información únicamente para brindarte un mejor servicio,
              nunca para venderte publicidad ni compartirla con terceros sin tu consentimiento.
            </Typography>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}
