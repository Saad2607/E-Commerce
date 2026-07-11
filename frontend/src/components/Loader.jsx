import { useLoader } from "../context/LoaderContext";

const Loader = () => {
    const { loading } = useLoader();

    if (!loading) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex flex-col justify-center items-center z-[100]">
            <div className="qk-card px-8 py-6 flex flex-col items-center gap-4 animate-scale-in">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-yellow-200 dark:border-yellow-900 rounded-full" />
                    <div className="absolute inset-0 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading...</p>
            </div>
        </div>
    );
};

export default Loader;
