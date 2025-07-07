import React from 'react';

export default function TermosPage() {
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(42,77,140,0.08)' }}>
      <h1 style={{ color: 'var(--color-azul-confianca)', fontWeight: 800, fontSize: 32, marginBottom: 24 }}>Termos e Condições de Uso</h1>
      <p>Bem-vindo ao PedZap! Ao criar uma conta e utilizar nossos serviços, você concorda com os termos abaixo:</p>
      <ol style={{ margin: '24px 0', paddingLeft: 24 }}>
        <li><b>Uso da Plataforma:</b> O PedZap é destinado à gestão de pedidos e atendimento virtual para estabelecimentos e clientes autorizados.</li>
        <li><b>Privacidade:</b> Suas informações são protegidas conforme nossa Política de Privacidade. Não compartilhamos dados pessoais sem consentimento.</li>
        <li><b>Comunicações:</b> Ao aceitar, você pode receber e-mails e notificações sobre novidades, promoções e atualizações. Você pode cancelar a qualquer momento.</li>
        <li><b>Responsabilidades:</b> O uso indevido da plataforma pode resultar em suspensão ou exclusão da conta.</li>
        <li><b>Alterações:</b> Os termos podem ser atualizados periodicamente. Avisaremos sobre mudanças relevantes.</li>
      </ol>
      <p>Para dúvidas, entre em contato pelo e-mail <a href="mailto:contato@pedzap.com">contato@pedzap.com</a>.</p>
      <p style={{ marginTop: 32, color: '#888', fontSize: 14 }}>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
    </div>
  );
} 