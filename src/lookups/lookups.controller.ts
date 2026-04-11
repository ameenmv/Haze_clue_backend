import { Controller, Get } from '@nestjs/common';

@Controller('lookups')
export class LookupsController {
  @Get('subjects')
  getSubjects() {
    return [
      { id: 'math', name: 'Mathematics' },
      { id: 'science', name: 'Science' },
      { id: 'english', name: 'English' },
      { id: 'history', name: 'History' },
      { id: 'geographic', name: 'Geography' },
    ];
  }

  @Get('grade-levels')
  getGradeLevels() {
    return [
      { id: 'grade-1', name: 'Grade 1' },
      { id: 'grade-2', name: 'Grade 2' },
      { id: 'grade-3', name: 'Grade 3' },
      { id: 'grade-4', name: 'Grade 4' },
      { id: 'grade-5', name: 'Grade 5' },
      { id: 'grade-6', name: 'Grade 6' },
      { id: 'grade-7', name: 'Grade 7' },
      { id: 'grade-8', name: 'Grade 8' },
      { id: 'grade-9', name: 'Grade 9' },
      { id: 'grade-10', name: 'Grade 10' },
      { id: 'grade-11', name: 'Grade 11' },
      { id: 'grade-12', name: 'Grade 12' },
    ];
  }
}
