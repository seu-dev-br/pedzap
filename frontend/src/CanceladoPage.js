import { Card, Button } from 'antd';

export default function CanceladoPage() {
  return (
    <Card style={{ maxWidth: 500, margin: '32px auto', textAlign: 'center' }}>
      <h2>Pagamento cancelado</h2>
      <p>Você pode tentar novamente quando quiser.</p>
      <Button type="primary" href="/">Voltar ao painel</Button>
    </Card>
  );
} 