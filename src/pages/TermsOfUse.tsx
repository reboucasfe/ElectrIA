import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsOfUse = () => {
  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Termos de Uso</h1>
      </div>

      <div className="prose prose-lg max-w-none">
        <p>Bem-vindo à EletricIA! Ao acessar e utilizar nossa plataforma, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Por favor, leia-os atentamente.</p>

        <h2>1. Aceitação dos Termos</h2>
        <p>Ao criar uma conta, acessar ou usar qualquer parte da EletricIA, você concorda com estes Termos de Uso e com nossa Política de Privacidade. Se você não concordar com qualquer parte destes termos, não deverá usar nossa plataforma.</p>

        <h2>2. Alterações nos Termos</h2>
        <p>Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Notificaremos você sobre quaisquer alterações publicando os novos Termos nesta página. Seu uso continuado da plataforma após a publicação de quaisquer modificações constitui sua aceitação dessas alterações.</p>

        <h2>3. Uso da Plataforma</h2>
        <ul>
          <li>Você deve ter pelo menos 18 anos para usar a EletricIA.</li>
          <li>Você é responsável por manter a confidencialidade de sua conta e senha.</li>
          <li>Você concorda em usar a plataforma apenas para fins lícitos e de acordo com estes Termos.</li>
          <li>É proibido o uso da plataforma para enviar spam, conteúdo ilegal, ofensivo ou que viole direitos de terceiros.</li>
        </ul>

        <h2>4. Propriedade Intelectual</h2>
        <p>Todo o conteúdo presente na EletricIA, incluindo textos, gráficos, logotipos, ícones, imagens, clipes de áudio, downloads digitais e software, é propriedade da EletricIA ou de seus fornecedores de conteúdo e é protegido pelas leis de direitos autorais.</p>

        <h2>5. Limitação de Responsabilidade</h2>
        <p>A EletricIA não será responsável por quaisquer danos diretos, indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, mas não se limitando a, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes de (i) seu acesso ou uso ou incapacidade de acessar ou usar a plataforma; (ii) qualquer conduta ou conteúdo de terceiros na plataforma; (iii) qualquer conteúdo obtido da plataforma; e (iv) acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo, seja com base em garantia, contrato, delito (incluindo negligência) ou qualquer outra teoria legal, tenhamos ou não sido informados da possibilidade de tais danos.</p>

        <h2>6. Rescisão</h2>
        <p>Podemos rescindir ou suspender seu acesso à nossa plataforma imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.</p>

        <h2>7. Lei Aplicável</h2>
        <p>Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar seus conflitos de disposições legais.</p>

        <h2>8. Contato</h2>
        <p>Se você tiver alguma dúvida sobre estes Termos de Uso, entre em contato conosco através do e-mail: contato@electricia.com.br.</p>
      </div>
    </div>
  );
};

export default TermsOfUse;