import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { FilePlus2, History, BarChart3, Settings, Truck, UserCircle, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNavigate } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r border-slate-200">
        <SidebarHeader className="h-16 flex items-center justify-center border-b px-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2 font-bold text-lg w-full">
            <Truck className="h-6 w-6 text-emerald-400" />
            <span>CIOT Express</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="pt-4 bg-slate-900">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/'}
                className="text-slate-300 hover:text-white hover:bg-slate-800 data-[active=true]:bg-slate-800 data-[active=true]:text-white mx-2 rounded-md"
              >
                <Link to="/">
                  <FilePlus2 className="w-4 h-4" /> <span>Nova Operação</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/historico'}
                className="text-slate-300 hover:text-white hover:bg-slate-800 data-[active=true]:bg-slate-800 data-[active=true]:text-white mx-2 rounded-md mt-1"
              >
                <Link to="/historico">
                  <History className="w-4 h-4" /> <span>Histórico</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/relatorios'}
                className="text-slate-300 hover:text-white hover:bg-slate-800 data-[active=true]:bg-slate-800 data-[active=true]:text-white mx-2 rounded-md mt-1"
              >
                <Link to="/relatorios">
                  <BarChart3 className="w-4 h-4" /> <span>Relatórios</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/configuracoes'}
                className="text-slate-300 hover:text-white hover:bg-slate-800 data-[active=true]:bg-slate-800 data-[active=true]:text-white mx-2 rounded-md mt-1"
              >
                <Link to="/configuracoes">
                  <Settings className="w-4 h-4" /> <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-slate-50 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white px-4 shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-2" />
            <h1 className="text-lg font-semibold ml-2 text-slate-800">Portal de Operações</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              API ANTT Conectada
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border cursor-pointer hover:bg-slate-200 transition-colors">
                  <UserCircle className="w-5 h-5 text-slate-600" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Minha Conta</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
