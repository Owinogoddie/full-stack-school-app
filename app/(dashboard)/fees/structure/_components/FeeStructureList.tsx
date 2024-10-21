import React from 'react';
 interface GradeClass {
    gradeId: number;
    gradeName: string;
    classes: {
      id: number;
      name: string;
    }[];
  }
 export interface FeeStructure {
    id: string;
    feeType: {
      name: string;
      description?: string;
    };
    baseAmount: number;
    gradeClasses: GradeClass[];
    studentCategories: string[];
    term: string;
    specialProgramme: string | null;
    effectiveDate: Date;
    version: number;
  }
interface FeeStructureListProps {
  feeStructures: FeeStructure[];
}

const FeeStructureList: React.FC<FeeStructureListProps> = ({ feeStructures }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {feeStructures.map((structure) => (
        <FeeStructureCard key={structure.id} structure={structure} />
      ))}
    </div>
  );
};

export default FeeStructureList;


interface FeeStructureCardProps {
  structure: FeeStructure;
}

const FeeStructureCard: React.FC<FeeStructureCardProps> = ({ structure }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{structure.feeType.name}</h2>
      <div className="space-y-2">
        <p><strong>Base Amount:</strong> {structure.baseAmount.toLocaleString()}</p>
        <p><strong>Term:</strong> {structure.term}</p>
        <p><strong>Special Programme:</strong> {structure.specialProgramme || 'N/A'}</p>
        <div>
          <strong>Grades & Classes:</strong>
          <ul className="list-disc list-inside">
            {structure.gradeClasses.map((gc) => (
              <li key={gc.gradeId}>
                {gc.gradeName}: {gc.classes.map((c) => c.name).join(', ')}
              </li>
            ))}
          </ul>
        </div>
        <p><strong>Student Categories:</strong> {structure.studentCategories.join(', ') || 'All Categories'}</p>
        <p><strong>Last updated:</strong> {new Date(structure.effectiveDate).toLocaleDateString()}</p>
        <p><strong>Version:</strong> {structure.version}</p>
      </div>
    </div>
  );
};
