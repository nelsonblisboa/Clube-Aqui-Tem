import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    canonical?: string;
}

const SEO = ({ title, description, canonical }: SEOProps) => {
    const siteTitle = "Clube Aqui Tem Vantagens e Benefícios";
    const fullTitle = `${title} | ${siteTitle}`;
    const metaDescription = description || "Economize todos os dias com descontos exclusivos, telemedicina 24h, assistência funeral e muito mais por apenas R$19,99/mês";

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            {canonical && <link rel="canonical" href={canonical} />}
        </Helmet>
    );
};

export default SEO;
