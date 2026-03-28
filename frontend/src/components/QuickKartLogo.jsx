const QuickKartLogo = () => {
  return (
    <div className="flex items-center gap-2 cursor-pointer">

      <img
        src="/logo.svg"
        alt="QuickKart Logo"
        className="w-8 h-8"
      />

      <span className="text-2xl font-bold">
        <span className="text-white dark:text-white">Quick</span>
        <span className="text-yellow-400">Kart</span>
      </span>
    </div>
  );
};

export default QuickKartLogo;