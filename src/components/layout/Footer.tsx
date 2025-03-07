import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-4 mt-8">
      <div className="container flex justify-between items-center">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Vikum Karunathilake. All rights reserved.</p>
          <div className="flex gap-4">
          <p className="text-sm">Powerd By <a target="_blank" href="https://elixircraft.net/">Elixircraft</a></p>
             </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/VikumKarunathilake" target="_blank" rel="noopener noreferrer">
            <img src="github.png" alt="Github" className="h-6 w-6 hover:text-secondary" />
          </a>
          {/* Add more social media icons as needed */}
        </div>
      </div>
    </footer>
  );
}
