import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-2">CalcAI</h3>
            <p className="text-sm text-muted-foreground">Sua calculadora inteligente no WhatsApp.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-sm text-muted-foreground hover:text-primary">Funcionalidades</Link></li>
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary">Preços</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">Sobre</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Política de Privacidade</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Termos de Serviço</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CalcAI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};