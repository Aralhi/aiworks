import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto flex justify-between items-center py-4">
        <div className="social">
          <a href="#">
            <i className="fab fa-facebook fa-2x mr-4"></i>
          </a>
          <a href="#">
            <i className="fab fa-twitter fa-2x mr-4"></i>
          </a>
          <a href="#">
            <i className="fab fa-linkedin fa-2x"></i>
          </a>
        </div>
        <div className="copyright">&copy; AI works，让AI触手可及</div>
      </div>
    </footer>
  );
}
