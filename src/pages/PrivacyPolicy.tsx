import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Política de Privacidade</h1>
      </div>

      <div className="prose prose-lg max-w-none">
        <p>A sua privacidade é de extrema importância para nós da EletricIA. Esta Política de Privacidade descreve como coletamos, usamos, processamos e compartilhamos suas informações pessoais ao utilizar nossa plataforma.</p>

        <h2>1. Informações que Coletamos</h2>
        <p>Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:</p>
        <ul>
          <li><strong>Informações de Cadastro:</strong> Nome completo, e-mail, senha, nome da empresa (opcional), número de WhatsApp, como nos conheceu.</li>
          <li><strong>Dados de Uso:</strong> Informações sobre como você acessa e usa a plataforma, como páginas visitadas, tempo de sessão, recursos utilizados.</li>
          <li><strong>Dados de Pagamento:</strong> Informações relacionadas à sua assinatura e transações (processadas por terceiros seguros, não armazenamos dados completos de cartão de crédito).</li>
          <li><strong>Dados de Propostas:</strong> Conteúdo das propostas geradas, informações de clientes inseridas para propostas.</li>
        </ul>

        <h2>2. Como Usamos Suas Informações</h2>
        <p>Utilizamos as informações coletadas para:</p>
        <ul>
          <li>Fornecer, operar e manter nossa plataforma.</li>
          <li>Melhorar, personalizar e expandir nossa plataforma.</li>
          <li>Entender e analisar como você usa nossa plataforma.</li>
          <li>Desenvolver novos produtos, serviços, recursos e funcionalidades.</li>
          <li>Comunicar-nos com você, diretamente ou através de um de nossos parceiros, para atendimento ao cliente, para fornecer atualizações e outras informações relacionadas à plataforma, e para fins de marketing e promoção.</li>
          <li>Processar suas transações e gerenciar sua assinatura.</li>
          <li>Detectar e prevenir fraudes.</li>
        </ul>

        <h2>3. Compartilhamento de Informações</h2>
        <p>Não vendemos suas informações pessoais. Podemos compartilhar suas informações com:</p>
        <ul>
          <li><strong>Provedores de Serviço:</strong> Terceiros que nos ajudam a operar a plataforma (ex: processadores de pagamento, serviços de hospedagem, ferramentas de análise).</li>
          <li><strong>Parceiros de Negócios:</strong> Para oferecer promoções ou serviços conjuntos, sempre com seu consentimento.</li>
          <li><strong>Requisitos Legais:</strong> Se exigido por lei ou em resposta a processos legais válidos.</li>
        </ul>

        <h2>4. Segurança dos Dados</h2>
        <p>Implementamos medidas de segurança razoáveis para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela Internet ou armazenamento eletrônico é 100% seguro.</p>

        <h2>5. Seus Direitos de Privacidade (LGPD)</h2>
        <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de:</p>
        <ul>
          <li>Acessar seus dados pessoais.</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
          <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
          <li>Revogar seu consentimento a qualquer momento.</li>
        </ul>
        <p>Para exercer esses direitos, entre em contato conosco.</p>

        <h2>6. Cookies</h2>
        <p>Utilizamos cookies e tecnologias de rastreamento semelhantes para monitorar a atividade em nossa plataforma e armazenar certas informações. Você pode configurar seu navegador para recusar todos os cookies ou para indicar quando um cookie está sendo enviado.</p>

        <h2>7. Links para Outros Sites</h2>
        <p>Nossa plataforma pode conter links para outros sites que não são operados por nós. Não temos controle e não assumimos responsabilidade pelo conteúdo, políticas de privacidade ou práticas de quaisquer sites ou serviços de terceiros.</p>

        <h2>8. Alterações a Esta Política de Privacidade</h2>
        <p>Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade nesta página. Aconselhamos que você revise esta Política de Privacidade periodicamente para quaisquer alterações.</p>

        <h2>9. Contato</h2>
        <p>Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco através do e-mail: contato@electricia.com.br.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;