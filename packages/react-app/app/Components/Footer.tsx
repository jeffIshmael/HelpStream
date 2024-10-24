const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left Section */}
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">HelpStream</h3>
            <p className="text-sm">Empowering communities through decentralized funding.</p>
          </div>

        

          {/* Right Section */}
          <div className="flex space-x-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775a4.92 4.92 0 002.164-2.723c-.951.555-2.005.959-3.127 1.175a4.905 4.905 0 00-8.36 4.468A13.915 13.915 0 011.671 3.15a4.902 4.902 0 001.517 6.545A4.885 4.885 0 01.96 9.557v.062a4.902 4.902 0 003.933 4.808 4.907 4.907 0 01-2.212.084 4.903 4.903 0 004.576 3.4A9.84 9.84 0 010 19.54a13.9 13.9 0 007.548 2.212c9.058 0 14.01-7.505 14.01-14.01 0-.213-.005-.425-.015-.637A10.025 10.025 0 0024 4.557z" />
              </svg>
            </a>
            <a href="https://github.com/jeffIshmael" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.11.793-.26.793-.577 0-.285-.011-1.04-.017-2.04-3.338.724-4.042-1.613-4.042-1.613-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.304.76-1.604-2.665-.305-5.467-1.332-5.467-5.93 0-1.31.469-2.381 1.236-3.221-.124-.304-.536-1.528.116-3.183 0 0 1.008-.322 3.302 1.23a11.48 11.48 0 013.007-.404 11.49 11.49 0 013.007.404c2.293-1.552 3.3-1.23 3.3-1.23.653 1.655.241 2.879.118 3.183.77.84 1.236 1.911 1.236 3.221 0 4.61-2.805 5.623-5.478 5.92.43.372.814 1.103.814 2.222 0 1.606-.014 2.898-.014 3.293 0 .319.192.692.801.575C20.565 21.798 24 17.302 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.23 0H1.77C.79 0 0 .774 0 1.723v20.555C0 23.227.79 24 1.77 24h20.46c.98 0 1.77-.774 1.77-1.723V1.723C24 .774 23.21 0 22.23 0zM7.12 20.451H3.56V9.027h3.56v11.424zM5.34 7.738a2.07 2.07 0 110-4.138 2.07 2.07 0 010 4.138zM20.44 20.451h-3.56v-5.864c0-1.4-.028-3.201-1.953-3.201-1.955 0-2.255 1.526-2.255 3.1v5.965h-3.56V9.027h3.417v1.563h.05c.476-.9 1.637-1.849 3.372-1.849 3.604 0 4.27 2.37 4.27 5.454v6.256z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-4 text-sm text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} HelpStream. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
