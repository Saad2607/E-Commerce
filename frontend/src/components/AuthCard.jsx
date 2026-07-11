const AuthCard = ({ title, subtitle, children, footer }) => {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10 bg-gray-50 dark:bg-gray-900 hero-pattern relative overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-slide-up">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <img src="/logo.svg" alt="QuickKart" className="w-11 h-11 drop-shadow" />
                        <span className="text-2xl font-bold">
                            <span className="text-gray-900 dark:text-white">Quick</span>
                            <span className="text-yellow-500">Kart</span>
                        </span>
                    </div>
                </div>

                <div className="qk-card p-8 shadow-xl">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                        {subtitle && (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                        )}
                    </div>

                    {children}

                    {footer && (
                        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthCard;
