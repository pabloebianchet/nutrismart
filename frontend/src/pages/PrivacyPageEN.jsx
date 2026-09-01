import { Box, Typography, Container, Paper, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import usePageMeta from "../hooks/usePageMeta";

const C = { brand: "#0B5E55", surface: "#F7F9F8", border: "rgba(11,94,85,0.12)", text: "#0F2420", muted: "#4A6B67", faint: "#8AADAA" };

const Section = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography component="h2" sx={{ fontSize: 16, fontWeight: 800, color: C.brand, mb: 1.5, letterSpacing: "-0.2px" }}>{title}</Typography>
    <Box sx={{ fontSize: 14, color: C.muted, lineHeight: 1.85 }}>{children}</Box>
  </Box>
);

const P = ({ children }) => <Typography sx={{ fontSize: 14, color: C.muted, lineHeight: 1.85, mb: 1.5 }}>{children}</Typography>;
const Li = ({ children }) => <Typography component="li" sx={{ fontSize: 14, color: C.muted, lineHeight: 1.85, mb: 0.5, ml: 2 }}>{children}</Typography>;

export default function PrivacyPageEN() {
  usePageMeta({
    title:       "Privacy Policy — Nui App",
    description: "How Nui collects, uses, and protects your personal and health data.",
    canonical:   "/en/privacy",
    alternates: [
      { hreflang: "es-AR",    href: "/privacidad" },
      { hreflang: "en",       href: "/en/privacy" },
      { hreflang: "x-default", href: "/privacidad" },
    ],
  });
  const updated = "September 2026";

  return (
    <Box sx={{ background: C.surface, minHeight: "100vh", py: 6 }}>
      <Container maxWidth="md">

        <Box sx={{ mb: 5 }}>
          <Typography
            component={Link}
            to="/en"
            sx={{ fontSize: 13, color: C.brand, fontWeight: 700, textDecoration: "none", mb: 2, display: "inline-block", "&:hover": { textDecoration: "underline" } }}
          >
            ← Back to Nui
          </Typography>
          <Typography component="h1" sx={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: "-0.8px", mb: 1 }}>
            Privacy Policy
          </Typography>
          <Typography sx={{ fontSize: 13, color: C.faint }}>Last updated: {updated}</Typography>
        </Box>

        <Box sx={{ mb: 3, p: 2.5, borderRadius: 3, bgcolor: "#FFF8E1", border: "1px solid rgba(245,166,35,0.3)" }}>
          <Typography sx={{ fontSize: 13, color: "#7B5800", fontWeight: 700, mb: 0.5 }}>
            📝 Draft notice
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#5D4200", lineHeight: 1.7 }}>
            This page is a good-faith draft, written to reflect how Nui actually collects and uses data
            today. It has not yet been reviewed by a licensed attorney. If you have questions about your
            specific legal rights, please consult independent counsel.
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, p: { xs: 3, md: 5 } }}>

          <Section title="1. Who we are">
            <P>
              Nui is operated by its founding team, based in Argentina, and offered to users worldwide,
              including the United States. For any question about this policy or your data, contact us at{" "}
              <strong>info@nuiapp.com</strong>.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="2. Information we collect">
            <P>To provide the service, we collect:</P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li><strong>Identification data:</strong> your name and email address.</Li>
              <Li><strong>Health-related data:</strong> biological sex, age, weight, height, and physical activity level — used to personalize analysis, recipes, and training plans. We treat this as sensitive information and do not sell it.</Li>
              <Li><strong>Nutrition analysis history:</strong> text extracted from product labels you analyze, scores, and analysis dates.</Li>
              <Li><strong>Usage data:</strong> training plans generated, completed sessions, and healthy points earned.</Li>
              <Li><strong>Payment data:</strong> processed exclusively by Stripe Inc. Nui does not store your card details.</Li>
              <Li><strong>Technical data:</strong> IP address, browser type, and cookies (see our <Typography component={Link} to="/en/legal" sx={{ color: C.brand, fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>Cookie Policy</Typography>).</Li>
            </Box>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="3. How we use your information">
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li>Provide AI-powered nutrition analysis personalized to your profile.</Li>
              <Li>Generate personalized training plans and recipe suggestions.</Li>
              <Li>Calculate general body-metric indicators (e.g. BMI) for informational purposes.</Li>
              <Li>Manage your account, subscription, and payments.</Li>
              <Li>Send service-related emails and notifications (configurable from your profile).</Li>
              <Li>Measure basic product usage with Google Analytics, only after you accept cookies (see below).</Li>
            </Box>
            <P><strong>We do not sell your personal information, and we do not use your health data for advertising.</strong></P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="4. Service providers we use">
            <P>To operate Nui, we share the minimum necessary data with these providers:</P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li><strong>OpenAI, L.L.C.:</strong> processes nutrition label text and generates analysis, recipes, and training plans.</Li>
              <Li><strong>Google LLC:</strong> account sign-in (Google OAuth) and, if you accept cookies, product analytics (Google Analytics).</Li>
              <Li><strong>Stripe, Inc.:</strong> payment processing and subscription management for US customers.</Li>
              <Li><strong>MongoDB Atlas (MongoDB, Inc.):</strong> database hosting.</Li>
              <Li><strong>Cloudinary:</strong> hosting for images generated within the app.</Li>
            </Box>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="5. Data retention">
            <P>
              We keep your data while your account is active. If you request account deletion, we will delete
              or anonymize your data within <strong>30 days</strong>, except where we're required to retain
              certain records (e.g. billing records) for longer.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="6. Your rights">
            <P>
              Depending on where you live, you may have rights to know what data we hold about you, request
              a copy of it, correct it, delete it, or opt out of certain uses (for example, California residents
              have specific rights under the CCPA/CPRA). We honor these rights for all users, regardless of location:
            </P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li><strong>Access:</strong> know what personal data we hold about you.</Li>
              <Li><strong>Correction:</strong> fix inaccurate or outdated data.</Li>
              <Li><strong>Deletion:</strong> request that we delete your data.</Li>
              <Li><strong>Opt-out:</strong> we don't sell personal data, so there is nothing to opt out of on that front — you can still opt out of analytics cookies at any time (see the cookie banner or your browser settings).</Li>
            </Box>
            <P>
              To exercise any of these rights, email <strong>info@nuiapp.com</strong> with your name and
              registered email. We aim to respond within a reasonable time, generally no more than 30 days.
            </P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="7. Security">
            <P>We use reasonable technical measures to protect your data, including:</P>
            <Box component="ul" sx={{ pl: 1, mb: 2 }}>
              <Li>Password hashing (bcrypt).</Li>
              <Li>Encrypted connections (HTTPS/TLS).</Li>
              <Li>Expiring authentication tokens (JWT).</Li>
              <Li>Restricted internal access to user data.</Li>
            </Box>
            <P>No system is 100% secure. If a breach affects your data, we will notify you as required by applicable law.</P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="8. Children">
            <P>Nui is not directed at children under 13, and we do not knowingly collect data from them.</P>
          </Section>

          <Divider sx={{ mb: 4, borderColor: C.border }} />

          <Section title="9. Changes to this policy">
            <P>
              We may update this policy from time to time. For material changes, we'll notify you by email
              or with a notice inside the app.
            </P>
          </Section>

          <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: "#E6F5F3", border: `1px solid rgba(11,94,85,0.15)` }}>
            <Typography sx={{ fontSize: 13, color: C.brand, fontWeight: 700, mb: 0.5 }}>
              🔒 Our commitment to your privacy
            </Typography>
            <Typography sx={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
              Nui handles health information, which we treat as especially sensitive. We use it only to
              provide you a better service — never to sell you advertising or share it with third parties
              without your knowledge.
            </Typography>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}
