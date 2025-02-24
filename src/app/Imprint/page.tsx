export default function Imprint() {
  return (
    <div className='py-20'>
      <div className='mx-auto max-w-3xl px-4'>
        <h1 className='mb-8 text-4xl font-bold'>Impressum</h1>

        <div className='prose prose-lg'>
          <h2>Angaben gemäß § 5 TMG</h2>
          <p>
            GlanzMeister GmbH
            <br />
            Musterstraße 123
            <br />
            12345 Stadt
          </p>

          <h2>Kontakt</h2>
          <p>
            Telefon: +49 123 456789
            <br />
            E-Mail: info@glanzmeister.de
          </p>

          <h2>Registereintrag</h2>
          <p>
            Eintragung im Handelsregister.
            <br />
            Registergericht: Amtsgericht Musterstadt
            <br />
            Registernummer: HRB 12345
          </p>

          <h2>Umsatzsteuer-ID</h2>
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
            <br />
            DE 123456789
          </p>

          <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p>
            Max Mustermann
            <br />
            Musterstraße 123
            <br />
            12345 Stadt
          </p>

          <h2>Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:
            https://ec.europa.eu/consumers/odr/.
            <br />
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </p>

          <p>
            Wir sind nicht bereit oder verpflichtet, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen.
          </p>
        </div>
      </div>
    </div>
  );
}
