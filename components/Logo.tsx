export default function Logo({ 
    size = 'md', 
    showText = true 
  }: { 
    size?: string; 
    showText?: boolean 
  }) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-[#0ABAB5] to-[#1D3557] rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">O</span>
        </div>
        {showText && <span className="text-2xl font-bold text-[#2D3748]">Operly</span>}
      </div>
    );
  }
  