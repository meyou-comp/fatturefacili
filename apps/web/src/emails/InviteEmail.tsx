import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface InviteEmailProps {
  organizationName?: string;
  inviteLink?: string;
}

export const InviteEmail = ({
  organizationName = 'MEYOU Srl',
  inviteLink = 'https://fatturefacili.com/invite/1234567890',
}: InviteEmailProps) => {
  const previewText = `Hai ricevuto un invito da ${organizationName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Banner */}
          <Section style={headerBanner}>
            <Img src={`${process.env.NEXT_PUBLIC_APP_URL || 'https://fatturefacili.com'}/emailgraphic.png`} width="600" alt="Fatture Facili" style={{ display: 'block', outline: 'none', border: 'none', textDecoration: 'none' }} />
          </Section>
          
          {/* Content */}
          <Section style={contentSection}>
            <Heading style={h1}>
              Hai ricevuto un invito da: <br />
              <strong>{organizationName}</strong>
            </Heading>
            
            <Text style={text}>
              {organizationName} ti ha invitato su Fatture Facili!<br />
              Accetta l'invito per visualizzare tutte le informazioni di fatturazione!
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={inviteLink}>
                Accetta l'invito
              </Button>
            </Section>
            
            <Text style={supportText}>
              Ti serve aiuto? Contattaci a team@meyou.company!
            </Text>
          </Section>
          
          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Stai ricevendo questo perché sei stato invitato da fatturefacili.com<br />
              Se pensi che ci sia un errore, <Link href="mailto:support@fatturefacili.com" style={footerLink}>clicca qui</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '8px',
  overflow: 'hidden',
  maxWidth: '600px',
  marginTop: '40px',
  marginBottom: '40px',
};

const headerBanner = {
  backgroundColor: '#ffffff',
  padding: '0',
  textAlign: 'center' as const,
};

const contentSection = {
  padding: '40px 40px 30px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'normal',
  lineHeight: '1.4',
  margin: '0 0 30px',
};

const text = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 40px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginBottom: '50px',
};

const button = {
  backgroundColor: '#ABF88D',
  borderRadius: '8px',
  color: '#000000',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 40px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};

const supportText = {
  color: '#1a1a1a',
  fontSize: '16px',
  margin: '0',
};

const footer = {
  backgroundColor: '#E8FCDD',
  padding: '24px 40px',
};

const footerText = {
  color: '#1a1a1a',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const footerLink = {
  color: '#000000',
  fontWeight: 'bold',
  textDecoration: 'none',
};

export default InviteEmail;
