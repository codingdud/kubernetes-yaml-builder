import Lottie from "lottie-react";
import sorryAnimation from "../../assets/sorry.json"; // download a free "sorry" animation from lottiefiles.com

export function MobileOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-center md:hidden dark:bg-gray-900">
      <div className="p-6 text-gray-900 dark:text-white">
        <Lottie
          autoplay
          loop
          animationData={sorryAnimation}
          style={{ height: "150px", width: "150px" }}
        />
        <h2 className="mt-4 text-2xl font-bold">Oops! Mobile Not Supported</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          This app works best on a desktop for full drag & drop features.  
          Please switch to a larger screen 🚀
        </p>
        <button
          onClick={() => window.open("https://github.com/codingdud/kubernetes-yaml-builder")}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-500 transition"
        >
          Learn More
        </button>
      </div>
    </div>
  );
}
