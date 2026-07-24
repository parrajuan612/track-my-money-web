"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, FileText, Landmark, Lock, AlertCircle, Loader2, UploadCloud, FileUp } from "lucide-react";
import { statementService } from "@/services/statement.service";
import { accountService, Account } from "@/services/account.service"; // ¡Importamos el servicio de cuentas!

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. ESTADOS
  const [file, setFile] = useState<File | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [password, setPassword] = useState("");
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // 2. EFECTO PARA CARGAR LAS CUENTAS AL ABRIR EL MODAL
  useEffect(() => {
    if (isOpen) {
      const fetchAccounts = async () => {
        setLoadingAccounts(true);
        try {
          const data = await accountService.getAccounts();
          setAccounts(data || []);
        } catch (error) {
          console.error("Error cargando cuentas:", error);
          setError("No se pudieron cargar tus cuentas. Revisa tu conexión.");
        } finally {
          setLoadingAccounts(false);
        }
      };
      fetchAccounts();
    } else {
      // Limpiar estados al cerrar
      clearFile();
      setSelectedAccountId("");
      setPassword("");
      setError("");
    }
  }, [isOpen]);

  // 3. EVENTOS DRAG & DROP
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError("");

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== "application/pdf") {
        setError("Lo sentimos, solo aceptamos archivos PDF bancarios.");
        return;
      }
      setFile(droppedFile);
    }
  }, []);

  // 4. FUNCIONES NORMALES
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Por favor, sube el archivo PDF de tu extracto.");
      return;
    }
    if (!selectedAccountId) {
      setError("Por favor, selecciona a qué cuenta pertenece este extracto.");
      return;
    }

    // Buscamos la cuenta seleccionada para extraer su bank_id
    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
    if (!selectedAccount) {
      setError("La cuenta seleccionada no es válida.");
      return;
    }

    setLoading(true);

    try {
      // Le pasamos el bank_id de la cuenta al parser para que sepa cómo leer el PDF
      const bankId = selectedAccount.bank_id.toString();
      const result = await statementService.parseStatement(file, bankId, password);
      
      // Guardamos el resultado Y el ID de la cuenta en sessionStorage para la siguiente pantalla
      sessionStorage.setItem("parsedStatement", JSON.stringify(result));
      sessionStorage.setItem("targetAccountId", selectedAccountId); 
      sessionStorage.setItem("targetBankId", bankId);
      onClose();
      router.push("/dashboard/upload/review");
    } catch (err: any) {
      console.error("Error en carga:", err);
      setError("No pudimos procesar el archivo. Revisa la contraseña o que el PDF no esté corrupto.");
    } finally {
      setLoading(false);
    }
  };

  // 5. RETORNO TEMPRANO
  if (!isOpen) return null;

  // 6. RENDERIZADO
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1f35]/60 backdrop-blur-sm p-4 transition-opacity duration-300">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-2xl relative border border-[#ece9f6]">
        
        <button 
          onClick={onClose}
          className="absolute right-7 top-7 text-[#b5b5c3] hover:text-[#ff4d4d] transition-colors rounded-full p-1 hover:bg-red-50"
        >
          <X size={20} />
        </button>

        <div className="mb-9 flex items-center gap-5 border-b border-[#ece9f6] pb-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#5b38ff] text-white shadow-lg shadow-[#5b38ff]/20">
            <UploadCloud size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#1f1f35] tracking-tight">Cargar Extracto Bancario</h2>
            <p className="mt-1 text-sm text-[#8c8ca5]">Sube tu PDF para sincronizar tus movimientos automáticamente.</p>
          </div>
        </div>

        {error && (
          <div className="mb-7 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 shadow-inner">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#1f1f35]">1. Selecciona tu archivo PDF</label>
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />

            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer h-[180px]
                  ${isDragging 
                    ? "border-[#5b38ff] bg-[#f0edff] scale-[1.02]" 
                    : "border-[#ece9f6] bg-[#f8f9fc] hover:border-[#5b38ff] hover:bg-[#f0edff]/50"
                  }`}
              >
                <FileUp size={42} strokeWidth={1} className={`mb-4 transition-colors ${isDragging ? "text-[#5b38ff]" : "text-[#b5b5c3]"}`} />
                <p className="text-sm font-bold text-[#1f1f35]">Arrastra tu PDF aquí</p>
                <p className="text-xs text-[#8c8ca5] mt-1">o haz clic para buscar en tu equipo</p>
                <p className="text-[10px] text-[#b5b5c3] mt-3 uppercase font-medium tracking-wider">Máx. 10MB</p>
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl border border-[#ece9f6] bg-[#f8f9fc] p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-[#5b38ff] shadow-sm border border-[#ece9f6]">
                  <FileText size={28} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-[#1f1f35] truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs text-[#8c8ca5]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={clearFile}
                  className="text-xs font-bold text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1f1f35]">2. Cuenta de Destino</label>
              <div className="relative">
                <Landmark size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5b5c3]" />
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  disabled={loadingAccounts || accounts.length === 0}
                  className="w-full appearance-none rounded-xl border border-[#ece9f6] bg-white py-3.5 pl-11 pr-10 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-1 focus:ring-[#5b38ff] transition-all disabled:opacity-60"
                >
                  <option value="" disabled>
                    {loadingAccounts ? "Cargando cuentas..." : accounts.length === 0 ? "Sin cuentas. ¡Crea una!" : "Selecciona una cuenta"}
                  </option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.bank?.name})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#b5b5c3]">
                    ▼
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1f1f35]">3. Clave PDF <span className="text-[11px] font-medium text-[#8c8ca5]">(Opcional)</span></label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5b5c3]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#ece9f6] bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-1 focus:ring-[#5b38ff] transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !file || !selectedAccountId}
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#5b38ff] py-4 text-base font-bold text-white transition-all hover:bg-[#4620ff] hover:shadow-lg hover:shadow-[#5b38ff]/20 disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="mr-3 animate-spin" /> Analizando tu extracto...
              </>
            ) : (
              <>
                <FileUp size={20} className="mr-3" /> Procesar y Revisar Movimientos
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#b5b5c3] border-t border-[#ece9f6] pt-5">
          Tus datos están encriptados y seguros. Cumplimos con estándares PCI-DSS.
        </div>
      </div>
    </div>
  );
}