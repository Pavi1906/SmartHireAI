import { 
  InterviewType, 
  InterviewTypeMetadata 
} from '../../types/interview';
import { INTERVIEW_TYPE_METADATA } from '../../services/interviewService';
import { Badge } from '../ui/badge';
import { 
  Code2, 
  Terminal, 
  BrainCircuit, 
  Users, 
  Settings2, 
  Layers, 
  Clock, 
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

interface InterviewTypeSelectorProps {
  selectedType: InterviewType;
  onSelectType: (type: InterviewType) => void;
}

const TYPE_ICONS: Record<InterviewType, any> = {
  Technical: Code2,
  Coding: Terminal,
  Aptitude: BrainCircuit,
  Behavioral: Users,
  'System Design': Settings2,
  Mixed: Layers
};

export function InterviewTypeSelector({
  selectedType,
  onSelectType
}: InterviewTypeSelectorProps) {
  const types: InterviewType[] = [
    'Technical',
    'Coding',
    'Aptitude',
    'Behavioral',
    'System Design',
    'Mixed'
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {types.map((type) => {
        const meta: InterviewTypeMetadata = INTERVIEW_TYPE_METADATA[type];
        const isSelected = selectedType === type;
        const IconComponent = TYPE_ICONS[type] || Code2;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelectType(type)}
            className={`w-full text-left p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between relative group outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isSelected
                ? 'bg-primary/10 border-primary shadow-sm shadow-primary/10'
                : 'bg-card hover:bg-secondary/40 border-border hover:border-border/80'
            }`}
          >
            {isSelected && (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono">
                <CheckCircle2 className="h-3 w-3" /> Selected
              </div>
            )}

            <div className="space-y-3 w-full">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground group-hover:bg-primary/20 group-hover:text-primary'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    {meta.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {meta.defaultDuration} mins
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" /> {meta.defaultQuestionCount} questions
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {meta.shortDesc}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {meta.targetSkills.slice(0, 3).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-[10px] bg-secondary/50 border-border/60 text-muted-foreground font-mono"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
