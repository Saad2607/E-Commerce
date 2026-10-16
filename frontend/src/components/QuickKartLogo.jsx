const QuickKartLogo = () => {
  return (
    <div className="flex items-center gap-2 cursor-pointer">

      <img
        src="/logo.svg"
        alt="QuickKart Logo"
        className="w-8 h-8"
      />

      <span className="text-2xl font-black tracking-tight">
        <span className="text-gray-900 dark:text-white transition-colors">Quick</span>
        <span className="text-amber-500 dark:text-yellow-400">Kart</span>
      </span>
    </div>
  );
};

export default QuickKartLogo;