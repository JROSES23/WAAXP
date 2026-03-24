export default function Logo({ 
    size = 'md', 
    showText = true 
  }: { 
    size?: string; 
    showText?: boolean 
  }) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f9d58] via-[#14b27a] to-[#0d7a8f] shadow-[0_10px_25px_-15px_rgba(15,157,88,0.8)]">
          <span className="text-white font-semibold text-lg tracking-wide">O</span>
          <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-[#1d4ed8]" />
        </div>
        {showText && <span className="text-2xl font-bold text-slate-900">WAAXP</span>}
      </div>
    );
  }
  
