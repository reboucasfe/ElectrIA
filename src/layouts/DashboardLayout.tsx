import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import { UserNav } from '@/components/dashboard/UserNav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import MobileSidebar from '@/components/dashboard/MobileSidebar';
import React, { useState } from 'react'; // Importar useState

const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Estado para controlar o Sheet mobile

  React.useEffect(() => {
    document.body.style.overflow = 'hidden'; // Esconde a barra de rolagem do body
    return () => {
      document.body.style.overflow = ''; // Restaura a barra de rolagem do body ao sair
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between md:justify-end items-center p-4 bg-white border-b">
           <div className="md:hidden">
             <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}> {/* Controla o estado do Sheet */}
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <MobileSidebar onClose={() => setIsMobileSidebarOpen(false)} /> {/* Passa a função de fechar */}
                </SheetContent>
              </Sheet>
           </div>
          <UserNav />
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;