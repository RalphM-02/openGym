// Fictional prototype content. No health data or upstream licensed media.
export const exercises = [
  { id: 'bench', name: 'Barbell bench press', muscle: 'CHEST · COMPOUND', weight: '50', reps: '8', sets: 3 },
  { id: 'row', name: 'Seated cable row', muscle: 'BACK · COMPOUND', weight: '40', reps: '10', sets: 3 },
  { id: 'press', name: 'Dumbbell shoulder press', muscle: 'SHOULDERS', weight: '14', reps: '10', sets: 3 },
  { id: 'curl', name: 'Dumbbell curl', muscle: 'ARMS', weight: '10', reps: '12', sets: 3 },
];
export const habits = [
  { id: 'walk', title: 'Get a little fresh air', detail: 'A 20-minute walk', icon: 'walk-outline' },
  { id: 'water', title: 'Keep water close', detail: 'Your daily hydration habit', icon: 'water-outline' },
  { id: 'wind', title: 'Make room to wind down', detail: '10 minutes without a screen', icon: 'moon-outline' },
];
export const seedHistory = [
  { id: 'sample-1', name: 'Lower body', date: 'Sample · Tuesday', sets: 12, sample: true },
  { id: 'sample-2', name: 'Upper body', date: 'Sample · Monday', sets: 12, sample: true },
];
export function freshSets() {
  return Object.fromEntries(exercises.map(ex => [ex.id, Array.from({ length: ex.sets }, () => ({ weight: ex.weight, reps: ex.reps, done: false }))]));
}
