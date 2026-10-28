import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, AppState, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exercises, freshSets, habits, seedHistory } from './src/data';

const C = { bg: '#F6F5F0', ink: '#202C28', muted: '#778079', green: '#275A43', lime: '#D7ED9B', white: '#FFFFFF', line: '#E5E7DE', pale: '#EAF0E5', orange: '#F4DFC4' };
const KEY = 'werk-out-prototype-v1';
const dayKey = () => new Date().toLocaleDateString('en-CA');
const initial = { habits: {}, checkins: {}, history: [], notes: {}, session: null };
const tabs = [ ['Today', 'sunny-outline'], ['Train', 'barbell-outline'], ['Progress', 'stats-chart-outline'], ['Coach', 'people-outline'] ];
const countDone = sets => Object.values(sets || {}).flat().filter(set => set.done).length;

function Icon({ name, color = C.ink, size = 22 }) { return <Ionicons name={name} color={color} size={size} />; }
function Label({ children, light }) { return <Text style={[s.label, light && { color: '#C5D8CB' }]}>{children}</Text>; }
function Button({ children, onPress, secondary, disabled, icon }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, secondary && s.secondary, disabled && { opacity: .4 }, pressed && { opacity: .75 }]}>
    <Text style={[s.buttonText, secondary && { color: C.ink }]}>{children}</Text>{icon && <Icon name={icon} color={secondary ? C.ink : C.white} size={19} />}
  </Pressable>;
}
function Heading({ title, right, onPress }) { return <View style={s.sectionHead}><Text style={s.h2}>{title}</Text>{right && (onPress ? <Pressable accessibilityRole="button" onPress={onPress} hitSlop={10}><Text style={s.link}>{right}</Text></Pressable> : <Text style={s.link}>{right}</Text>)}</View>; }
function Stat({ value, label }) { return <View style={s.stat}><Text style={s.statValue}>{value}</Text><Text style={s.caption}>{label}</Text></View>; }

export default function App() { return <SafeAreaProvider><StatusBar style="dark" /><Prototype /></SafeAreaProvider>; }

function Prototype() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('Today');
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [sheet, setSheet] = useState(null);
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState('7');
  const [checkNote, setCheckNote] = useState('');
  const [client, setClient] = useState('Alex Morgan');
  const [review, setReview] = useState('');
  const [now, setNow] = useState(Date.now());
  const [notice, setNotice] = useState('');
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => { if (raw) setState({ ...initial, ...JSON.parse(raw) }); })
      .catch(() => setStorageError('Saved prototype data could not be loaded. Changes will stay in memory for this visit.'))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready && !storageError) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => setStorageError('Could not save on this device. Your changes are only available for this visit.'));
  }, [state, ready, storageError]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const sub = AppState.addEventListener('change', () => setNow(Date.now()));
    return () => { clearInterval(timer); sub.remove(); };
  }, []);
  const today = dayKey();
  const todayHabits = state.habits[today] || [];
  const checkin = state.checkins[today];
  const session = state.session;
  const completed = countDone(session?.sets);
  const rest = Math.max(0, Math.ceil(((session?.restUntil || 0) - now) / 1000));
  const weekStart = new Date(); weekStart.setHours(0, 0, 0, 0); weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
  const weekDates = Array.from({ length: 7 }, (_, i) => { const date = new Date(weekStart); date.setDate(date.getDate() + i); return date.getDate(); });
  const weekly = state.history.filter(item => item.at >= weekStart.getTime()).length;
  const updateSession = update => setState(prev => ({ ...prev, session: { ...prev.session, ...update } }));
  function openCheckin() { setEnergy(checkin?.energy || 3); setSleep(checkin?.sleep || '7'); setCheckNote(checkin?.note || ''); setSheet('checkin'); }
  function startWorkout() {
    if (!session) setState(prev => ({ ...prev, session: { sets: freshSets(), started: Date.now(), restUntil: 0 } }));
    setSheet('workout');
  }
  function editSet(id, index, field, value) {
    setState(prev => ({ ...prev, session: { ...prev.session, sets: { ...prev.session.sets, [id]: prev.session.sets[id].map((row, i) => i === index ? { ...row, [field]: value, done: false } : row) } } }));
  }
  function toggleSet(id, index) {
    const row = session.sets[id][index];
    if (!row.done && (!Number.isFinite(Number(row.weight)) || Number(row.weight) < 0 || !Number.isInteger(Number(row.reps)) || Number(row.reps) <= 0 || !row.weight.trim())) {
      Alert.alert('Check this set', 'Enter a weight of zero or more and a positive whole number of reps.'); return;
    }
    setState(prev => ({ ...prev, session: { ...prev.session, restUntil: row.done ? 0 : Date.now() + 90000, sets: { ...prev.session.sets, [id]: prev.session.sets[id].map((r, i) => i === index ? { ...r, done: !r.done } : r) } } }));
  }
  function finish() {
    const record = { id: String(Date.now()), at: Date.now(), name: 'Upper body A', date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), sets: completed, exercises: session.sets, minutes: Math.max(1, Math.round((Date.now() - session.started) / 60000)) };
    setState(prev => ({ ...prev, session: null, history: [record, ...prev.history] }));
    setSheet(null); setTab('Progress'); setNotice('Workout saved. A little stronger, one session at a time.');
  }
  function openReview(name) { setClient(name); setReview(state.notes[name] || ''); setSheet('review'); }
  if (!ready) return <SafeAreaView style={s.loading}><ActivityIndicator color={C.green} /><Text style={s.body}>Getting your space ready…</Text></SafeAreaView>;

  return <View style={s.app}><SafeAreaView edges={['top']} style={s.topSafe}>
    <View style={s.topbar}><View style={s.row}><View style={s.brandMark}><Icon name="barbell" color={C.white} size={19} /></View><Text style={s.brand}>werk-out<Text style={{ color: C.green }}>.</Text></Text></View><View style={s.avatar}><Text style={s.avatarText}>YOU</Text></View></View>
  </SafeAreaView>
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.demoPill}><View style={s.dot} /><Text style={s.demoText}>YOUR FITNESS PLAYGROUND · SAMPLE DATA</Text></View>
      {!!storageError && <Text accessibilityRole="alert" style={s.error}>{storageError}</Text>}
      {tab === 'Today' && <>
        <Text style={s.eyebrow}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</Text>
        <Text style={s.title}>Make time{ '\n' }for <Text style={s.serif}>yourself.</Text></Text>
        <Text style={s.subtitle}>Small steps. Stronger days.</Text>
        <View style={s.weekCard}><View style={s.between}><Label>THIS WEEK</Label><Text style={s.link}>{weekly} / 3 sessions</Text></View><View style={s.weekDays}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <View key={i} style={s.dayColumn}><Text style={s.dayLabel}>{day}</Text><View style={[s.dayCircle, i === (new Date().getDay() + 6) % 7 && s.dayToday]}><Text style={s.dayNumber}>{weekDates[i]}</Text></View></View>)}</View><Text style={s.caption}>A three-session goal. Go at your own pace.</Text></View>
        <View style={s.hero}><View style={s.between}><Label light>YOUR NEXT SESSION</Label><View style={s.heroIcon}><Icon name="barbell-outline" color={C.lime} size={26} /></View></View><Text style={s.heroTitle}>Upper body A</Text><Text style={s.heroSub}>Build strength. Find your rhythm.</Text><View style={[s.row, { gap: 18, marginVertical: 22 }]}><Text style={s.heroMeta}>4 exercises</Text><Text style={s.heroMeta}>~40 min</Text><Text style={s.heroMeta}>Gym</Text></View><Pressable accessibilityRole="button" style={s.limeButton} onPress={startWorkout}><Text style={s.limeButtonText}>{session ? 'Continue workout' : 'Let’s get moving'}</Text><Icon name="arrow-forward" size={20} /></Pressable><Text style={s.heroFoot}>STARTER SESSION · EDIT WEIGHTS AS YOU GO</Text></View>
        <Heading title="How are you feeling?" /><Pressable accessibilityRole="button" onPress={openCheckin} style={[s.card, s.checkCard]}><View style={s.softIcon}><Icon name="sunny-outline" color={C.green} size={26} /></View><View style={s.flex}><Text style={s.cardTitle}>{checkin ? 'You checked in today' : 'A moment to check in'}</Text><Text style={s.caption}>{checkin ? `Energy ${checkin.energy}/5 · ${checkin.sleep} hours of sleep` : 'Energy, sleep, and what’s on your mind.'}</Text></View><Icon name="arrow-forward" size={19} /></Pressable>
        <Heading title="The little things" right={`${todayHabits.length} / 3`} />
        <View style={s.card}>{habits.map((habit, i) => { const done = todayHabits.includes(habit.id); return <Pressable key={habit.id} accessibilityRole="checkbox" accessibilityState={{ checked: done }} accessibilityLabel={habit.title} onPress={() => setState(prev => { const chosen = prev.habits[today] || []; return { ...prev, habits: { ...prev.habits, [today]: done ? chosen.filter(id => id !== habit.id) : [...chosen, habit.id] } }; })} style={[s.habit, i < 2 && s.borderBottom]}><Icon name={habit.icon} color={C.green} /><View style={s.flex}><Text style={s.cardTitle}>{habit.title}</Text><Text style={s.caption}>{habit.detail}</Text></View><View style={[s.checkbox, done && s.checked]}>{done && <Icon name="checkmark" size={17} color={C.white} />}</View></Pressable>; })}</View>
      </>}
      {tab === 'Train' && <>
        <Text style={s.eyebrow}>SHOW UP FOR YOURSELF</Text><Text style={s.title}>Your training<Text style={s.serif}> space.</Text></Text><Text style={s.subtitle}>A simple plan. Room to make it your own.</Text>
        <View style={[s.card, { backgroundColor: C.pale }]}><Label>STARTER PROGRAM</Label><Text style={[s.h2, { marginTop: 10 }]}>The everyday strong plan</Text><Text style={s.body}>Three sessions a week, with space for life in between. Try the first upper-body session below.</Text><View style={s.row}><Stat value="3" label="days / week" /><Stat value="4" label="exercises today" /><Stat value="12" label="working sets" /></View></View>
        <Heading title="Upper body A" right="~40 minutes" onPress={startWorkout} />
        {exercises.map((ex, i) => <View style={[s.card, s.exercisePreview]} key={ex.id}><View style={s.exerciseNumber}><Text style={s.numberText}>{String(i + 1).padStart(2, '0')}</Text></View><View style={s.flex}><Text style={s.cardTitle}>{ex.name}</Text><Text style={s.caption}>{ex.sets} sets × {ex.reps} reps · {ex.weight} kg</Text></View></View>)}
        <Button onPress={startWorkout} icon="arrow-forward">{session ? 'Continue session' : 'Start this session'}</Button><Text style={s.footnote}>Prototype plan with sample weights. Adjust them to your own training.</Text>
      </>}
      {tab === 'Progress' && <>
        <Text style={s.eyebrow}>EVERY SESSION COUNTS</Text><Text style={s.title}>Look how far{ '\n' }you’ve <Text style={s.serif}>come.</Text></Text><Text style={s.subtitle}>Your real prototype sessions appear here.</Text>
        <View style={[s.card, s.row]}><Stat value={state.history.length} label="saved sessions" /><Stat value={state.history.reduce((n, item) => n + item.sets, 0)} label="sets logged" /><Stat value={Object.keys(state.checkins).length} label="check-ins" /></View>
        <Heading title="Your weekly rhythm" /><View style={s.card}><View style={s.between}><Text style={s.cardTitle}>Sessions this week</Text><Text style={s.link}>{weekly} / 3</Text></View><View style={s.track}><View style={[s.trackFill, { width: `${Math.min(weekly / 3, 1) * 100}%` }]} /></View><Text style={s.caption}>{weekly >= 3 ? 'Your weekly goal is complete.' : `${Math.max(0, 3 - weekly)} more to reach your three-session goal.`}</Text></View>
        <Heading title="Training journal" />
        {state.history.length === 0 && <View style={s.card}><Icon name="leaf-outline" color={C.green} size={30} /><Text style={[s.cardTitle, { marginTop: 12 }]}>Your story starts with one session</Text><Text style={s.body}>Log a set and finish a workout to see your own progress here.</Text><Button secondary onPress={() => setTab('Train')}>Explore your first workout</Button></View>}
        {[...state.history, ...seedHistory].map(item => <View key={item.id} style={[s.card, s.journalRow]}><View style={[s.softIcon, item.sample && { backgroundColor: C.bg }]}><Icon name={item.sample ? 'document-text-outline' : 'checkmark'} color={C.green} /></View><View style={s.flex}><Text style={s.cardTitle}>{item.name}</Text><Text style={s.caption}>{item.date} · {item.sets} completed sets</Text></View><Text style={s.badge}>{item.sample ? 'EXAMPLE' : 'SAVED'}</Text></View>)}
      </>}
      {tab === 'Coach' && <>
        <Text style={s.eyebrow}>COACH WORKSPACE · PREVIEW</Text><Text style={s.title}>A little guidance.{ '\n' }A lot of <Text style={s.serif}>growth.</Text></Text><Text style={s.subtitle}>See the other side of the coaching experience.</Text>
        <View style={s.coachNote}><Icon name="information-circle-outline" color={C.green} /><Text style={[s.caption, s.flex]}>Fictional clients. Review notes save on this device only; nothing is sent.</Text></View>
        <View style={[s.card, s.row]}><Stat value="3" label="sample clients" /><Stat value={3 - Object.keys(state.notes).filter(key => state.notes[key]?.trim()).length} label="without notes" /><Stat value="1" label="shared preview" /></View>
        <Heading title="Your people" />
        {[['Alex Morgan', 'AM', 'Your member activity', C.lime], ['Jamie Chen', 'JC', 'Sample · 2 of 3 sessions', C.orange], ['Sam Rivera', 'SR', 'Sample · New weekly check-in', '#E0E5F2']].map(([name, initials, detail, bg]) => <Pressable key={name} accessibilityRole="button" onPress={() => openReview(name)} style={[s.card, s.clientRow]}><View style={[s.clientAvatar, { backgroundColor: bg }]}><Text style={s.avatarText}>{initials}</Text></View><View style={s.flex}><Text style={s.cardTitle}>{name}</Text><Text style={s.caption}>{detail}</Text><Text style={s.clientStatus}>{state.notes[name]?.trim() ? 'Review note saved' : 'Open weekly review'}</Text></View><Icon name="chevron-forward" size={18} /></Pressable>)}
        <View style={[s.card, { backgroundColor: C.pale }]}><Label>THE CONNECTION</Label><Text style={[s.h2, { marginTop: 10 }]}>One week. Both perspectives.</Text><Text style={s.body}>Alex’s preview reflects the workouts and check-ins you log in the member tabs. Try logging a session, then open Alex’s review.</Text><Button secondary onPress={() => setTab('Today')}>Back to your day</Button></View>
      </>}
      <Text style={s.bottomNote}>A little better, together.   /   WERK-OUT</Text>
    </ScrollView>
    {!!notice && <View accessibilityRole="alert" style={s.toast}><Text style={s.toastText}>{notice}</Text></View>}
    <View style={[s.tabbar, { paddingBottom: Math.max(insets.bottom, 12) }]}>{tabs.map(([name, icon]) => <Pressable key={name} accessibilityRole="tab" accessibilityState={{ selected: tab === name }} accessibilityLabel={name} onPress={() => setTab(name)} style={s.tab}><View style={[s.tabIcon, tab === name && s.activeTab]}><Icon name={icon} color={tab === name ? C.green : C.muted} size={22} /></View><Text style={[s.tabText, tab === name && { color: C.green, fontWeight: '700' }]}>{name}</Text></Pressable>)}</View>

    <Modal visible={sheet !== null} animationType="slide" onRequestClose={() => setSheet(null)}>
      <SafeAreaView style={s.modalSafe}><KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.modalHeader}><View><Label>{sheet === 'workout' ? 'YOUR SESSION' : sheet === 'review' ? 'COACH PREVIEW' : 'DAILY CHECK-IN'}</Label><Text style={s.h2}>{sheet === 'workout' ? 'Upper body A' : sheet === 'review' ? client : 'Start with how you feel.'}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={() => setSheet(null)} style={s.close}><Icon name="close" /></Pressable></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.modalContent}>
          {sheet === 'checkin' && <>
            <Text style={s.body}>No perfect answers. Just a little awareness.</Text><Heading title="Your energy today" /><View style={s.energyRow}>{[1, 2, 3, 4, 5].map(n => <Pressable key={n} accessibilityRole="radio" accessibilityState={{ checked: energy === n }} accessibilityLabel={`Energy ${n} of 5`} onPress={() => setEnergy(n)} style={[s.energy, energy === n && s.energySelected]}><Text style={[s.energyNumber, energy === n && { color: C.white }]}>{n}</Text></Pressable>)}</View><View style={s.between}><Text style={s.caption}>Running low</Text><Text style={s.caption}>Feeling great</Text></View><Heading title="Hours of sleep" /><TextInput accessibilityLabel="Hours of sleep" value={sleep} onChangeText={setSleep} keyboardType="decimal-pad" style={s.input} maxLength={4} /><Heading title="Anything on your mind?" /><TextInput accessibilityLabel="Check-in note" value={checkNote} onChangeText={setCheckNote} multiline placeholder="A win, a challenge, or just how today feels…" placeholderTextColor={C.muted} style={[s.input, s.textArea]} maxLength={1000} /><Button onPress={() => { if (!sleep.trim() || !Number.isFinite(Number(sleep)) || Number(sleep) < 0 || Number(sleep) > 24) { Alert.alert('Check your sleep', 'Enter hours between 0 and 24.'); return; } setState(prev => ({ ...prev, checkins: { ...prev.checkins, [today]: { energy, sleep, note: checkNote } } })); setSheet(null); setNotice('Check-in saved. Thanks for showing up for yourself.'); }}>Save my check-in</Button>
          </>}
          {sheet === 'workout' && session && <>
            <View style={[s.card, { backgroundColor: C.pale }]}><View style={s.between}><Text style={s.cardTitle}>{completed} of 12 sets logged</Text><Text style={s.link}>{rest > 0 ? `Rest ${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}` : 'At your own pace'}</Text></View><View style={s.track}><View style={[s.trackFill, { width: `${completed / 12 * 100}%` }]} /></View><Text style={s.caption}>Rest timer runs while the app is open. No background alert.</Text>{rest > 0 && <Pressable accessibilityRole="button" onPress={() => updateSession({ restUntil: 0 })} style={{ marginTop: 12 }}><Text style={s.link}>Skip rest</Text></Pressable>}</View>
            {exercises.map((ex, i) => <View key={ex.id} style={s.card}><Label>{String(i + 1).padStart(2, '0')} / {ex.muscle}</Label><Text style={[s.h2, { marginTop: 8, marginBottom: 18 }]}>{ex.name}</Text><View style={s.setRow}><Text style={[s.label, { width: 32 }]}>SET</Text><Text style={[s.label, s.setColumn]}>KG</Text><Text style={[s.label, s.setColumn]}>REPS</Text><Text style={[s.label, { width: 44, textAlign: 'center' }]}>LOG</Text></View>{session.sets[ex.id].map((row, index) => <View style={s.setRow} key={index}><Text style={[s.cardTitle, { width: 32 }]}>{index + 1}</Text><TextInput accessibilityLabel={`${ex.name} set ${index + 1} weight in kg`} style={[s.setInput, row.done && s.doneInput]} keyboardType="decimal-pad" value={row.weight} maxLength={6} onChangeText={value => editSet(ex.id, index, 'weight', value)} /><TextInput accessibilityLabel={`${ex.name} set ${index + 1} reps`} style={[s.setInput, row.done && s.doneInput]} keyboardType="number-pad" value={row.reps} maxLength={3} onChangeText={value => editSet(ex.id, index, 'reps', value)} /><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: row.done }} accessibilityLabel={`Log ${ex.name} set ${index + 1}`} onPress={() => toggleSet(ex.id, index)} style={[s.logButton, row.done && s.checked]}><Icon name="checkmark" size={21} color={row.done ? C.white : C.muted} /></Pressable></View>)}</View>)}
            <Button disabled={!completed} onPress={finish}>Finish & save {completed} sets</Button><Text style={s.footnote}>Only checked sets are counted. You can close this screen and resume later.</Text>
          </>}
          {sheet === 'review' && <>
            <View style={s.coachNote}><Icon name="information-circle-outline" color={C.green} /><Text style={[s.caption, s.flex]}>{client === 'Alex Morgan' ? 'Linked prototype: this summary uses your member activity.' : 'This client’s summary is fictional sample content.'}</Text></View>
            <View style={[s.card, s.row]}><Stat value={client === 'Alex Morgan' ? weekly : 2} label="sessions this week" /><Stat value={client === 'Alex Morgan' ? (checkin ? `${checkin.energy}/5` : '—') : '4/5'} label="latest energy" /><Stat value={client === 'Alex Morgan' ? (checkin ? `${checkin.sleep}h` : '—') : '7.5h'} label="sleep" /></View>
            <Heading title="Member reflection" /><View style={s.card}><Text style={s.body}>{client === 'Alex Morgan' ? (checkin?.note || 'No reflection yet. Add a check-in from Today to see it here.') : '“Feeling more consistent this week. Fitting the sessions around work is getting easier.”'}</Text></View>
            <Heading title="Your review note" /><TextInput accessibilityLabel={`Review note for ${client}`} multiline value={review} onChangeText={setReview} maxLength={2000} style={[s.input, s.textArea]} placeholder="What went well? What would you adjust next week?" placeholderTextColor={C.muted} /><Button onPress={() => { setState(prev => ({ ...prev, notes: { ...prev.notes, [client]: review } })); setSheet(null); setNotice('Review note saved locally. Nothing was sent.'); }}>Save review note</Button><Text style={s.footnote}>Private prototype note. Client accounts, messaging, and program assignment are not connected yet.</Text>
          </>}
        </ScrollView>
      </KeyboardAvoidingView></SafeAreaView>
    </Modal>
  </View>;
}

const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: C.bg }, flex: { flex: 1 }, loading: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 16 }, topSafe: { backgroundColor: C.bg },
  topbar: { paddingHorizontal: 24, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, row: { flexDirection: 'row', alignItems: 'center', gap: 10 }, between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }, brandMark: { width: 30, height: 30, backgroundColor: C.green, borderRadius: 10, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] }, brand: { fontSize: 24, fontWeight: '800', letterSpacing: -1 }, avatar: { width: 38, height: 38, backgroundColor: C.line, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: C.green, fontSize: 11, fontWeight: '800' },
  content: { paddingHorizontal: 24, paddingBottom: 26, width: '100%', maxWidth: 560, alignSelf: 'center' }, demoPill: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10, marginBottom: 28 }, dot: { height: 5, width: 5, borderRadius: 3, backgroundColor: C.green }, demoText: { fontSize: 9, letterSpacing: 1.1, color: C.green, fontWeight: '700' }, eyebrow: { fontSize: 10, color: C.muted, letterSpacing: 1.6, fontWeight: '700', marginBottom: 12 }, title: { fontSize: 43, fontWeight: '700', color: C.ink, letterSpacing: -1.9, lineHeight: 48 }, serif: { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', fontWeight: '400', color: C.green }, subtitle: { color: C.muted, fontSize: 14, lineHeight: 22, marginTop: 12, marginBottom: 24 },
  label: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, color: C.muted }, h2: { fontSize: 19, fontWeight: '700', color: C.ink, letterSpacing: -.4 }, sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 28, marginBottom: 14 }, link: { color: C.green, fontWeight: '600', fontSize: 12 }, caption: { fontSize: 12, lineHeight: 19, color: C.muted }, body: { color: C.muted, fontSize: 14, lineHeight: 23, marginVertical: 10 }, cardTitle: { color: C.ink, fontSize: 14, fontWeight: '600', lineHeight: 21 }, card: { padding: 20, backgroundColor: C.white, borderRadius: 20, borderWidth: 1, borderColor: C.line, marginBottom: 10 },
  weekCard: { padding: 18, backgroundColor: '#EEEFE7', borderRadius: 18, marginBottom: 18 }, weekDays: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 }, dayColumn: { alignItems: 'center', gap: 8 }, dayLabel: { fontSize: 10, color: C.muted }, dayCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D8DDD1' }, dayToday: { backgroundColor: C.lime, borderColor: C.green }, dayNumber: { fontSize: 11, color: C.green, fontWeight: '600' },
  hero: { backgroundColor: C.green, borderRadius: 24, padding: 24 }, heroIcon: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#50745F', alignItems: 'center', justifyContent: 'center' }, heroTitle: { color: C.white, fontSize: 31, fontWeight: '600', letterSpacing: -.8, marginTop: 15 }, heroSub: { fontSize: 13, color: '#C5D8CB', marginTop: 6 }, heroMeta: { color: '#E3EBDC', fontSize: 12 }, limeButton: { backgroundColor: C.lime, borderRadius: 13, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, limeButtonText: { color: C.ink, fontWeight: '700', fontSize: 14 }, heroFoot: { color: '#B5C9BA', fontSize: 8, letterSpacing: .9, textAlign: 'center', marginTop: 15 },
  checkCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 17 }, softIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: C.pale, alignItems: 'center', justifyContent: 'center' }, habit: { flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 15 }, borderBottom: { borderBottomWidth: 1, borderBottomColor: C.line }, checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, borderColor: '#CCD3C8', alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: C.green, borderColor: C.green },
  button: { backgroundColor: C.green, borderRadius: 14, paddingHorizontal: 20, minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 10 }, secondary: { backgroundColor: C.pale }, buttonText: { color: C.white, fontSize: 14, fontWeight: '700' }, stat: { flex: 1, paddingVertical: 12 }, statValue: { color: C.green, fontSize: 28, fontWeight: '600', letterSpacing: -1, marginBottom: 4 }, exercisePreview: { flexDirection: 'row', alignItems: 'center', gap: 14 }, exerciseNumber: { width: 39, height: 45, borderRadius: 12, backgroundColor: C.pale, alignItems: 'center', justifyContent: 'center' }, numberText: { color: C.green, fontWeight: '600' }, footnote: { fontSize: 11, color: C.muted, lineHeight: 19, textAlign: 'center', marginTop: 14, paddingHorizontal: 10 }, track: { height: 7, borderRadius: 4, backgroundColor: C.line, marginVertical: 16, overflow: 'hidden' }, trackFill: { height: '100%', backgroundColor: C.green, borderRadius: 4 }, journalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }, badge: { fontSize: 8, letterSpacing: .6, color: C.muted, fontWeight: '700' }, coachNote: { flexDirection: 'row', gap: 10, backgroundColor: C.pale, borderRadius: 14, padding: 15, marginBottom: 18, alignItems: 'center' }, clientRow: { flexDirection: 'row', gap: 14, alignItems: 'center' }, clientAvatar: { width: 45, height: 45, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, clientStatus: { color: C.green, fontSize: 10, marginTop: 8, fontWeight: '600' }, bottomNote: { fontSize: 9, color: '#90998F', textAlign: 'center', letterSpacing: 1, marginTop: 28 },
  tabbar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 10, backgroundColor: C.bg }, tab: { flex: 1, alignItems: 'center', gap: 3 }, tabIcon: { width: 54, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, activeTab: { backgroundColor: C.pale }, tabText: { fontSize: 10, color: C.muted }, toast: { position: 'absolute', bottom: 105, left: 20, right: 20, backgroundColor: C.ink, borderRadius: 15, padding: 17 }, toastText: { color: C.white, fontSize: 13, lineHeight: 20 }, error: { color: '#94402D', backgroundColor: '#FCEAE2', padding: 14, borderRadius: 12, fontSize: 12, marginBottom: 16 },
  modalSafe: { flex: 1, backgroundColor: C.bg }, modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottomWidth: 1, borderBottomColor: C.line }, close: { padding: 8, backgroundColor: C.line, borderRadius: 20 }, modalContent: { padding: 24, paddingBottom: 45, maxWidth: 560, width: '100%', alignSelf: 'center' }, input: { backgroundColor: C.white, borderColor: C.line, borderWidth: 1, borderRadius: 14, padding: 17, fontSize: 16, color: C.ink }, textArea: { minHeight: 130, textAlignVertical: 'top', marginBottom: 12 }, energyRow: { flexDirection: 'row', gap: 12, marginBottom: 12 }, energy: { flex: 1, height: 54, backgroundColor: C.white, borderColor: C.line, borderWidth: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, energySelected: { backgroundColor: C.green, borderColor: C.green }, energyNumber: { color: C.green, fontSize: 20, fontWeight: '600' }, setRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 10 }, setColumn: { flex: 1, textAlign: 'center' }, setInput: { flex: 1, minWidth: 0, backgroundColor: C.bg, borderRadius: 10, paddingVertical: 12, fontSize: 17, color: C.ink, textAlign: 'center' }, doneInput: { backgroundColor: C.pale }, logButton: { width: 44, height: 44, backgroundColor: C.bg, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
