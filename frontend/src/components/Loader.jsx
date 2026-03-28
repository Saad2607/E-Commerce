import { useLoader } from "../context/LoaderContext";

const Loader = () => {
    const { loading } = useLoader();

    if (!loading) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
};

export default Loader;
