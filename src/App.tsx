import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import AnnonceDetail from "./pages/AnnonceDetail";
import APropos from "./pages/APropos";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminAnnonces from "./pages/admin/AdminAnnonces";
import AdminAnnonceForm from "./pages/admin/AdminAnnonceForm";
import AdminBatiments from "./pages/admin/AdminBatiments";
import AdminServices from "./pages/admin/AdminServices";
import AdminAPropos from "./pages/admin/AdminAPropos";
import AdminParametres from "./pages/admin/AdminParametres";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/annonce/:id" element={<AnnonceDetail />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminAnnonces />} />
            <Route path="annonces/:id" element={<AdminAnnonceForm />} />
            <Route path="batiments" element={<AdminBatiments />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="a-propos" element={<AdminAPropos />} />
            <Route path="parametres" element={<AdminParametres />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
