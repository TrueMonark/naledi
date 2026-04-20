import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequirementsCardProps {
  title: string;
  description: string;
  downloadKey: string;
  onDownload: (key: string) => void;
}

const RequirementsCard = ({
  title,
  description,
  downloadKey,
  onDownload,
}: RequirementsCardProps) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-card hover:shadow-elegant transition-shadow duration-300 flex flex-col h-full">
      <div className="text-center flex-1 flex flex-col">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-hero rounded-full flex items-center justify-center">
          <FileText className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-primary mb-4">{title}</h3>
        <p className="text-muted-foreground mb-6 flex-1">{description}</p>
        <Button
          variant="secondary"
          onClick={() => onDownload(downloadKey)}
          className="w-full group mt-auto">
          <Download className="mr-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
          Download PDF
        </Button>
      </div>
    </div>
  );
};

// Usage example:
const RequirementsSection = () => {
  const downloadPDF = (key: string) => {
    // Your download logic here
    console.log(`Downloading: ${key}`);
  };

  const cardsData = [
    {
      title: "Primary School Requirements",
      description: "School requirements for primary school admission.",
      downloadKey: "PRIMARY SCHOOL REQUIREMENTS",
    },
    {
      title: "Secondary School Requirements",
      description: "School requirements for secondary school admission.",
      downloadKey: "SECONDARY SCHOOL REQUIREMENTS",
    },
    {
      title: "Boarding Requirements for All Students",
      description:
        "Includes boarding fees, stationery lists, and other additional costs.",
      downloadKey: "BOARDING REQUIREMENTS",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
      {cardsData.map((card, index) => (
        <RequirementsCard
          key={index}
          title={card.title}
          description={card.description}
          downloadKey={card.downloadKey}
          onDownload={downloadPDF}
        />
      ))}
    </div>
  );
};

export default RequirementsCard;
