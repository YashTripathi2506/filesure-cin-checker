export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="disclaimer">
          This tool validates and decodes identifier formats. It does not independently verify company existence,
          registration status or compliance with the Ministry of Corporate Affairs.
        </p>
        <p className="footer-links">
          Sources:{' '}
          <a href="https://www.mca.gov.in/MinistryV2/noticearchieve.html" target="_blank" rel="noopener noreferrer">MCA notices</a>
          {' · '}
          <a href="https://www.mca.gov.in/MinistryV2/registrarofcompanies.html" target="_blank" rel="noopener noreferrer">MCA Registrars of Companies</a>
          {' · '}
          <a href="https://www.mca.gov.in" target="_blank" rel="noopener noreferrer">MCA portal (official company and LLP lookup)</a>
        </p>
        <p className="attribution">Technical assignment by Yash Tripathi for FileSure. Not an official FileSure product.</p>
      </div>
    </footer>
  );
}
