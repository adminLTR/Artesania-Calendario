
import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FDF2F2] p-8">
      <div className="w-full max-w-xl bg-white rounded-[4rem] p-12 md:p-16 shadow-2xl shadow-red-100/50 animate-in fade-in zoom-in duration-500 flex flex-col items-center">
        <div className="w-24 h-24 bg-[#E55B69] rounded-full flex items-center justify-center text-white font-black text-[38px] mb-10 shadow-xl shadow-red-100">A</div>
        <div className="text-center mb-12">
          <h1 className="text-[38px] font-manrope font-extrabold text-gray-800 uppercase tracking-tight leading-none">BIENVENIDO AL <span className="text-[#E55B69]">ESTUDIO</span></h1>
          <p className="text-[13px] font-black text-gray-300 uppercase tracking-[0.2em] mt-4">Gestión de Taller y Alumnos</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full space-y-8">
          <div>
            <label className="block text-[13px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-3">Usuario o Email</label>
            <input required type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-8 py-6 bg-red-50/30 border-2 border-transparent focus:border-[#E55B69] focus:bg-white rounded-[2rem] font-bold text-[20px] outline-none transition-all" placeholder="alexander@estudio.com" />
          </div>
          <div>
            <label className="block text-[13px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-3">Contraseña</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-8 py-6 bg-red-50/30 border-2 border-transparent focus:border-[#E55B69] focus:bg-white rounded-[2rem] font-bold text-[20px] outline-none transition-all" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-6 bg-[#E55B69] text-white rounded-[2.5rem] font-black shadow-xl uppercase tracking-widest text-[18px] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-4">
            {isLoading ? <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Entrar al Taller'}
          </button>
        </form>
        <p className="mt-12 text-[13px] font-black text-gray-300 uppercase text-center tracking-widest">Artesania & Calendario v1.0</p>
      </div>
    </div>
  );
};

export default Login;
