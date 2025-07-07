import { Card, Button } from 'antd';

export default function SucessoPage() {
  return (
    <Card style={{ maxWidth: 500, margin: '32px auto', textAlign: 'center' }}>
      <h2>Pagamento realizado com sucesso!</h2>
      <p>Seu acesso premium será liberado em instantes.</p>
      <Button type="primary" href="/">Voltar ao painel</Button>
    </Card>
  );
} 