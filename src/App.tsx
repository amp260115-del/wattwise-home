import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Users,
  Building2,
  Plus,
  Home,
  Lightbulb,
  Settings,
  Zap,
  IndianRupee,
  Trash2,
  Pencil,
  X,
  ChevronRight,
  Leaf,
  Fan,
  Refrigerator,
  Tv,
  WashingMachine,
  Microwave,
  Laptop,
  PlugZap,
  CircleHelp,
} from 'lucide-react';

type Appliance = {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  watts: number;
  hours: number;
  setting: string;
};
type SettingsState = { bill: number; rate: number; currency: string; solarKwh: number; solarOffset: number };
type Residence = {id:string;name:string;address:string; residents?: Member[] };
type Member = {id:string; name:string; username:string; email:string; role:string; avatar:string};
type UserProfile = {name:string; username:string; email:string; avatar:string};
const makeUsername = () => 'ww-' + crypto.randomUUID().replace(/-/g,'').slice(0,8).toLowerCase();
const catalog = [
  {
    category: 'Air conditioner',
    watts: 1200,
    icon: 'ac',
    setting:
      'Use 24–26°C cooling, clean filters monthly, and use sleep mode overnight.',
    saving: 18,
  },
  {
    category: 'Refrigerator',
    watts: 180,
    icon: 'fridge',
    setting:
      'Set the fridge near 3–5°C and freezer near −18°C; keep door seals clean and avoid hot food.',
    saving: 8,
  },
  {
    category: 'Television',
    watts: 100,
    icon: 'tv',
    setting:
      'Enable auto-brightness and power-saving mode; turn it fully off when not in use.',
    saving: 12,
  },
  {
    category: 'Washing machine',
    watts: 500,
    icon: 'washer',
    setting:
      'Use cold water and eco mode, and run full loads rather than several small loads.',
    saving: 20,
  },
  {
    category: 'Ceiling fan',
    watts: 70,
    icon: 'fan',
    setting:
      'Choose an efficient fan and switch it off in empty rooms; use a timer where possible.',
    saving: 10,
  },
  {
    category: 'Light bulb',
    watts: 10,
    icon: 'light',
    setting: 'Use LED bulbs and switch lights off when leaving a room.',
    saving: 65,
  },
  {
    category: 'Microwave',
    watts: 1000,
    icon: 'micro',
    setting:
      'Heat only what you need and avoid leaving the appliance on standby.',
    saving: 5,
  },
  {
    category: 'Laptop',
    watts: 65,
    icon: 'laptop',
    setting:
      'Use balanced or battery-saver mode, lower screen brightness, and enable sleep.',
    saving: 15,
  },
  {
    category: 'Water heater',
    watts: 2000,
    icon: 'plug',
    setting:
      'Use a moderate thermostat setting, insulate the tank if applicable, and use a timer.',
    saving: 12,
  },
  {
    category: 'Other appliance',
    watts: 100,
    icon: 'other',
    setting:
      'Switch off standby power where safe and check the product energy label.',
    saving: 5,
  },
];
const money = (n: number, currency: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
const energy = (a: Appliance) => (a.watts * a.hours) / 1000;
function IconFor({ category, size = 19 }: { category: string; size?: number }) {
  const props = { size, strokeWidth: 1.8 };
  if (category === 'Air conditioner' || category === 'Ceiling fan')
    return <Fan {...props} />;
  if (category === 'Refrigerator') return <Refrigerator {...props} />;
  if (category === 'Television') return <Tv {...props} />;
  if (category === 'Washing machine') return <WashingMachine {...props} />;
  if (category === 'Microwave') return <Microwave {...props} />;
  if (category === 'Laptop') return <Laptop {...props} />;
  if (category === 'Light bulb') return <Lightbulb {...props} />;
  if (category === 'Water heater') return <PlugZap {...props} />;
  return <Zap {...props} />;
}
const starter: Appliance[] = [
  {
    id: 'sample-ac',
    name: 'Living room AC',
    brand: 'Generic',
    model: 'Inverter split AC',
    category: 'Air conditioner',
    watts: 1200,
    hours: 5,
    setting: '24–26°C, sleep mode',
  },
  {
    id: 'sample-fridge',
    name: 'Kitchen fridge',
    brand: 'Generic',
    model: 'Double-door refrigerator',
    category: 'Refrigerator',
    watts: 180,
    hours: 24,
    setting: '3–5°C fridge / −18°C freezer',
  },
  {
    id: 'sample-fan',
    name: 'Bedroom fan',
    brand: 'Generic',
    model: 'Ceiling fan',
    category: 'Ceiling fan',
    watts: 70,
    hours: 8,
    setting: 'Medium speed when comfortable',
  },
];
function App() {
  const [page, setPage] = useState('Overview');
  const [appliances, setAppliances] = useState<Appliance[]>(() => {
    try {
      const v = localStorage.getItem('ww-appliances');
      return v ? JSON.parse(v) : starter;
    } catch {
      return starter;
    }
  });
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      return JSON.parse(
        localStorage.getItem('ww-settings') ||
          '{"bill":2500,"rate":8,"currency":"INR"}'
      );
    } catch {
      return { bill: 2500, rate: 8, currency: 'INR' };
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [profile,setProfile]=useState<'Family Head'|'Casual User'|'Landlord'>(()=>(localStorage.getItem('ww-profile') as 'Family Head'|'Casual User'|'Landlord')||'Casual User');
  const [userProfile,setUserProfile]=useState<UserProfile>(()=>{try{const saved=JSON.parse(localStorage.getItem('ww-user-profile')||'null');if(saved)return {...saved,username:saved.username==='homeuser'||!saved.username?makeUsername():saved.username};return {name:'Home User',username:makeUsername(),email:'',avatar:''}}catch{return {name:'Home User',username:makeUsername(),email:'',avatar:''}}});
  const [members,setMembers]=useState<Member[]>(()=>{try{return JSON.parse(localStorage.getItem('ww-members')||'[]')}catch{return []}});
  const [memberName,setMemberName]=useState(''); const [memberUsername,setMemberUsername]=useState(''); const [memberEmail,setMemberEmail]=useState(''); const [memberRole,setMemberRole]=useState('Family member');
  const [residences,setResidences]=useState<Residence[]>(()=>{try{return JSON.parse(localStorage.getItem('ww-residences')||'[]')}catch{return []}});
  const [residenceName,setResidenceName]=useState(''); const [residenceAddress,setResidenceAddress]=useState('');
  const [residentName,setResidentName]=useState(''); const [residentUsername,setResidentUsername]=useState(''); const [residentEmail,setResidentEmail]=useState(''); const [selectedResidence,setSelectedResidence]=useState('');
  const [chatInput,setChatInput]=useState(''); const [chatBusy,setChatBusy]=useState(false);
  const [chatMessages,setChatMessages]=useState<{role:'assistant'|'user';text:string}[]>([{role:'assistant',text:'Hi! Ask me about electricity bills, solar savings, appliance wattage, efficient settings, or electrical safety.'}]);
  const [editing, setEditing] = useState<Appliance | null>(null);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    name: '',
    brand: '',
    model: '',
    category: 'Air conditioner',
    watts: '1200',
    hours: '4',
    setting: '',
  });
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    localStorage.setItem('ww-appliances', JSON.stringify(appliances));
  }, [appliances]);
  useEffect(() => { localStorage.setItem('ww-settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('ww-profile',profile); }, [profile]);
  useEffect(() => { localStorage.setItem('ww-user-profile',JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('ww-members',JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('ww-residences',JSON.stringify(residences)); }, [residences]);
  const allUsernames = [userProfile.username,...members.map(m=>m.username),...residences.flatMap(r=>(r.residents||[]).map(m=>m.username))].map(x=>x.toLowerCase());
  const usernameAvailable = (value:string, ignoreId?:string) => ![userProfile.username,...members.filter(m=>m.id!==ignoreId).map(m=>m.username),...residences.flatMap(r=>(r.residents||[]).filter(m=>m.id!==ignoreId).map(m=>m.username))].some(x=>x.toLowerCase()===value.trim().toLowerCase());
  function handleAvatar(file?:File) { if(!file)return; if(!file.type.startsWith('image/'))return; if(file.size>2*1024*1024){alert('Please choose an image smaller than 2 MB.');return;} const reader=new FileReader(); reader.onload=()=>setUserProfile(p=>({...p,avatar:String(reader.result||'')})); reader.readAsDataURL(file); }
  const totals = useMemo(() => {
    const daily = appliances.reduce((s, a) => s + energy(a), 0);
    const monthly=daily*30; const grossCost=monthly*settings.rate; const solarUsed=Math.min(monthly,Math.max(0,Number(settings.solarKwh)||0)); const solarCredit=solarUsed*settings.rate*Math.min(100,Math.max(0,Number(settings.solarOffset)||0))/100;
    return {daily,monthly,grossCost,solarUsed,solarCredit,cost:Math.max(0,grossCost-solarCredit)};
  }, [appliances,settings.rate,settings.solarKwh,settings.solarOffset]);
  const recommendations = useMemo(
    () =>
      appliances
        .map(a => ({
          ...a,
          tip:
            catalog.find(c => c.category === a.category)?.setting ||
            'Check the energy label and switch the appliance off when it is not needed.',
          saving: catalog.find(c => c.category === a.category)?.saving || 5,
          save:
            (energy(a) *
              30 *
              settings.rate *
              (catalog.find(c => c.category === a.category)?.saving || 5)) /
            100,
        }))
        .sort((a, b) => b.save - a.save),
    [appliances, settings.rate]
  );
  function openAdd() {
    setEditing(null);
    setForm({
      name: '',
      brand: '',
      model: '',
      category: 'Air conditioner',
      watts: '1200',
      hours: '4',
      setting: '',
    });
    setShowForm(true);
  }
  function openEdit(a: Appliance) {
    setEditing(a);
    setForm({
      name: a.name,
      brand: a.brand,
      model: a.model,
      category: a.category,
      watts: String(a.watts),
      hours: String(a.hours),
      setting: a.setting,
    });
    setShowForm(true);
  }
  function saveAppliance(e: React.FormEvent) {
    e.preventDefault();
    const match = catalog.find(c => c.category === form.category);
    const item: Appliance = {
      id: editing?.id || crypto.randomUUID(),
      name: form.name.trim() || form.category,
      brand: form.brand.trim() || 'Generic',
      model: form.model.trim() || 'Not specified',
      category: form.category,
      watts: Math.max(1, Number(form.watts) || match?.watts || 100),
      hours: Math.min(24, Math.max(0, Number(form.hours) || 0)),
      setting: form.setting.trim() || match?.setting || 'Standard settings',
    };
    setAppliances(old =>
      editing ? old.map(a => (a.id === editing.id ? item : a)) : [...old, item]
    );
    setShowForm(false);
  }
  const filtered = appliances.filter(a =>
    (a.name + ' ' + a.brand + ' ' + a.model + ' ' + a.category)
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  const nav = [
    { name: profile==='Family Head'?'Family Dashboard':profile==='Landlord'?'Property Dashboard':'Overview', icon: <Activity size={18} /> },
    { name: profile==='Family Head'?'Family Home':profile==='Landlord'?'Property Energy':'My Home', icon: <Home size={18} /> },
    ...(profile==='Family Head'?[{name:'My Family',icon:<Users size={18}/>}]:[]),
    ...(profile==='Landlord'?[{name:'Residencies',icon:<Building2 size={18}/>}]:[]),
    { name: 'Recommendations', icon: <Lightbulb size={18} /> },
    { name: 'Analytics', icon: <Activity size={18} /> },
    { name: 'Profile', icon: <Home size={18} /> },
    { name: 'Help & AI', icon: <CircleHelp size={18} /> },
    { name: 'Settings', icon: <Settings size={18} /> },
  ];
  return (
    <div className={'shell role-shell role-'+profile.toLowerCase().replace(/\s+/g,'-')}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Zap size={23} fill="currentColor" />
          </div>
          <div>
            <b>WattWise</b>
            <small>HOME ENERGY</small>
          </div>
        </div>
        <div className="home-label">{profile==='Family Head'?'FAMILY CONTROL CENTER':profile==='Landlord'?'PROPERTY MANAGEMENT':'YOUR HOUSEHOLD'}</div>
        <nav>
          {nav.map(n => (
            <button
              key={n.name}
              className={page === n.name ? 'nav-item active' : 'nav-item'}
              onClick={() => setPage(n.name)}
            >
              {n.icon}
              <span>{n.name}</span>
              {n.name === 'My Home' && (
                <span className="nav-count">{appliances.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="leaf-circle">
            <Leaf size={20} />
          </div>
          <b>Small changes add up.</b>
          <p>Save energy, lower your bill, and make your home greener.</p>
          <button
            className="text-link"
            onClick={() => setPage('Recommendations')}
          >
            Explore tips <ChevronRight size={15} />
          </button>
        </div>
        <div className="privacy-note">
          Your home data stays in this browser.
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="mobile-brand">
            <Zap size={21} /> {profile==='Family Head'?'WattWise Family':profile==='Landlord'?'WattWise Properties':'WattWise'}
          </div>
          <div className="breadcrumb">
            Home <ChevronRight size={14} /> <b>{page}</b>
          </div>
          <button className="bill-chip" onClick={() => setPage('Settings')}>
            <span className="bill-dot" /> Monthly bill{' '}
            <b>{money(totals.cost, settings.currency)}</b>
            <Settings size={15} />
          </button>
        </header>
        <div className="content">
          {page === 'Overview' && (
            <>
              <div className="welcome">
                <div>
                  <div className="eyebrow">
                    <span className="eyebrow-dot" /> YOUR ENERGY AT A GLANCE
                  </div>
                  <h1>
                    {profile==='Family Head'?'Your family,':profile==='Landlord'?'Your properties,':'A smarter home'}
                    <br />
                    <em>{profile==='Family Head'?'one energy view.':profile==='Landlord'?'under control.':'starts with you.'}</em>
                  </h1>
                  <p>
                    {profile==='Family Head'?'Keep the household organized, compare energy use, and help everyone save.':profile==='Landlord'?'Review property energy, organize residences, and track resident lists in one place.':'Understand where your electricity goes and find easy ways to save.'}
                  </p>
                  <div className="welcome-actions">
                    <button className="primary-btn" onClick={openAdd}>
                      <Plus size={17} /> Add an appliance
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => setPage('Recommendations')}
                    >
                      See saving tips <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="hero-art">
                  <div className="sun-glow" />
                  <div className="house-illustration">
                    <div className="roof" />
                    <div className="house-body">
                      <div className="window w1" />
                      <div className="window w2" />
                      <div className="door" />
                      <div className="house-plant">✳</div>
                    </div>
                    <div className="house-ground" />
                  </div>
                  <div className="floating-bolt">
                    <Zap size={25} fill="currentColor" />
                  </div>
                  <div className="floating-leaf">
                    <Leaf size={21} />
                  </div>
                  <div className="art-caption">
                    <span /> Efficient home, happier planet
                  </div>
                </div>
              </div>
              {profile==='Family Head' && <div className="role-welcome-strip"><Users size={19}/><div><b>Family control center</b><span>{members.length} household members · Manage family accounts from Profile or My Family.</span></div><button className="secondary-btn" onClick={()=>setPage('My Family')}>Manage family</button></div>}
              {profile==='Landlord' && <div className="role-welcome-strip landlord-strip"><Building2 size={19}/><div><b>Property management</b><span>{residences.length} residences · {residences.reduce((sum,r)=>sum+(r.residents||[]).length,0)} residents recorded.</span></div><button className="secondary-btn" onClick={()=>setPage('Residencies')}>Manage properties</button></div>}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon mint">
                    <Zap size={19} />
                  </div>
                  <span className="stat-label">Daily energy use</span>
                  <div className="stat-number">
                    {totals.daily.toFixed(1)} <small>kWh</small>
                  </div>
                  <div className="stat-foot">
                    Estimated from your appliances
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon peach">
                    <IndianRupee size={19} />
                  </div>
                  <span className="stat-label">Estimated monthly cost</span>
                  <div className="stat-number">
                    {money(totals.cost, settings.currency)}
                  </div>
                  <div className="stat-foot">Based on your usage and rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon lilac">
                    <Home size={19} />
                  </div>
                  <span className="stat-label">In your home</span>
                  <div className="stat-number">
                    {appliances.length} <small>devices</small>
                  </div>
                  <div className="stat-foot">Tracked household appliances</div>
                </div>
              </div>
              <div className="section-heading">
                <div>
                  <h2>Your home energy mix</h2>
                  <p>Which devices use the most estimated energy?</p>
                </div>
                <button
                  className="text-link"
                  onClick={() => setPage('My Home')}
                >
                  View all devices <ChevronRight size={15} />
                </button>
              </div>
              <div className="panel energy-panel">
                {appliances.length === 0 ? (
                  <EmptyState onAdd={openAdd} />
                ) : (
                  <>
                    <div className="energy-list">
                      {[...appliances]
                        .sort((a, b) => energy(b) - energy(a))
                        .slice(0, 5)
                        .map(a => {
                          const share = totals.daily
                            ? (energy(a) / totals.daily) * 100
                            : 0;
                          return (
                            <div className="energy-row" key={a.id}>
                              <div className="device-icon">
                                <IconFor category={a.category} />
                              </div>
                              <div className="energy-device">
                                <b>{a.name}</b>
                                <small>
                                  {a.category} · {a.hours}h daily
                                </small>
                                <div className="bar-track">
                                  <div
                                    className="bar-fill"
                                    style={{ width: share + '%' }}
                                  />
                                </div>
                              </div>
                              <div className="energy-value">
                                <b>{energy(a).toFixed(2)} kWh</b>
                                <small>{share.toFixed(0)}% of daily use</small>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    <div className="panel-bottom">
                      <span>
                        <span className="legend-dot" /> Estimated energy
                        consumption
                      </span>
                      <span>30-day estimate</span>
                    </div>
                  </>
                )}
              </div>
              <div className="tip-banner">
                <div className="tip-spark">
                  <Lightbulb size={22} />
                </div>
                <div>
                  <b>A little change can make a big difference</b>
                  <p>
                    {recommendations[0]
                      ? recommendations[0].tip
                      : 'Add your appliances to get practical tips for your home.'}
                  </p>
                </div>
                <button
                  onClick={() => setPage('Recommendations')}
                  aria-label="View recommendations"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </>
          )}
          {page === 'My Home' && (
            <>
              <div className="page-intro">
                <div className="eyebrow">YOUR PERSONAL INVENTORY</div>
                <h1>
                  My <em>Home.</em>
                </h1>
                <p>
                  Every appliance in one place. Add a device, tell us how you
                  use it, and we’ll estimate its energy footprint.
                </p>
              </div>
              <div className="toolbar">
                <div className="searchbox">
                  <Activity size={17} />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search appliances, brands or models…"
                  />
                </div>
                <button className="primary-btn" onClick={openAdd}>
                  <Plus size={17} /> Add appliance
                </button>
              </div>
              <div className="home-summary">
                <div>
                  <span>TRACKED DEVICES</span>
                  <b>{appliances.length}</b>
                </div>
                <div>
                  <span>DAILY TOTAL</span>
                  <b>
                    {totals.daily.toFixed(1)} <small>kWh</small>
                  </b>
                </div>
                <div>
                  <span>MONTHLY ESTIMATE</span>
                  <b>{money(totals.cost, settings.currency)}</b>
                </div>
              </div>
              {filtered.length === 0 ? (
                <EmptyState onAdd={openAdd} />
              ) : (
                <div className="appliance-grid">
                  {filtered.map(a => (
                    <article className="appliance-card" key={a.id}>
                      <div className="appliance-card-top">
                        <div className="device-icon large">
                          <IconFor category={a.category} size={24} />
                        </div>
                        <div className="card-actions">
                          <button
                            onClick={() => openEdit(a)}
                            aria-label={'Edit ' + a.name}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  'Remove ' + a.name + ' from My Home?'
                                )
                              )
                                setAppliances(old =>
                                  old.filter(x => x.id !== a.id)
                                );
                            }}
                            aria-label={'Remove ' + a.name}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <span className="category-label">{a.category}</span>
                      <h3>{a.name}</h3>
                      <p className="model-line">
                        {a.brand} · {a.model}
                      </p>
                      <div className="appliance-metrics">
                        <div>
                          <small>Power</small>
                          <b>{a.watts.toLocaleString()} W</b>
                        </div>
                        <div>
                          <small>Daily use</small>
                          <b>{a.hours} hours</b>
                        </div>
                      </div>
                      <div className="card-energy">
                        <span>Estimated daily energy</span>
                        <b>{energy(a).toFixed(2)} kWh</b>
                      </div>
                      <div className="device-setting">
                        <Lightbulb size={15} />
                        <span>{a.setting}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <div className="catalog-note">
                <CircleHelp size={17} />
                <span>
                  Can’t find your exact model? Add any brand and model manually,
                  then use the rated wattage from its label or manual for a
                  better estimate.
                </span>
              </div>
            </>
          )}
          {page === 'Recommendations' && (
            <>
              <div className="page-intro">
                <div className="eyebrow">PERSONALISED FOR YOUR HOME</div>
                <h1>
                  Save more. Use <em>less.</em>
                </h1>
                <p>
                  Practical settings and habits that can help reduce electricity
                  use without sacrificing comfort.
                </p>
              </div>
              <div className="recommend-hero">
                <div className="rec-icon">
                  <Leaf size={25} />
                </div>
                <div>
                  <span>YOUR POTENTIAL SAVINGS</span>
                  <b>
                    {money(
                      recommendations.reduce((s, a) => s + a.save, 0),
                      settings.currency
                    )}{' '}
                    <small>/ month</small>
                  </b>
                  <p>
                    Illustrative estimate if you apply each device’s typical
                    saving suggestion.
                  </p>
                </div>
              </div>
              {recommendations.length === 0 ? (
                <EmptyState onAdd={openAdd} />
              ) : (
                <div className="recommend-list">
                  {recommendations.map((a, i) => (
                    <article className="recommend-card" key={a.id}>
                      <div className="rec-rank">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="rec-device-icon">
                        <IconFor category={a.category} />
                      </div>
                      <div className="rec-copy">
                        <span>{a.category.toUpperCase()}</span>
                        <h3>{a.name}</h3>
                        <p>{a.tip}</p>
                        <div className="rec-meta">
                          <span>
                            <Activity size={14} /> {a.hours}h/day tracked
                          </span>
                          <span>
                            <Zap size={14} /> {energy(a).toFixed(2)} kWh/day
                          </span>
                        </div>
                      </div>
                      <div className="rec-saving">
                        <span>Potential saving</span>
                        <b>{money(a.save, settings.currency)}</b>
                        <small>per month</small>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <p className="disclaimer">
                Savings are rough guidance, not a guarantee. Actual results
                depend on the exact model, climate, tariff, usage and household
                conditions. Always follow the manufacturer’s safety
                instructions.
              </p>
            </>
          )}
          {page === 'Analytics' && <>
            <div className="page-intro"><div className="eyebrow">SEE THE BIG PICTURE</div><h1>Energy <em>analytics.</em></h1><p>Compare daily energy, rated watts, and estimated running costs by appliance.</p></div>
            <div className="stats-grid"><div className="stat-card"><span className="stat-label">Rated load</span><div className="stat-number">{appliances.reduce((s,a)=>s+a.watts,0).toLocaleString()} <small>W</small></div></div><div className="stat-card"><span className="stat-label">Monthly usage</span><div className="stat-number">{totals.monthly.toFixed(1)} <small>kWh</small></div></div><div className="stat-card"><span className="stat-label">Net estimate</span><div className="stat-number">{money(totals.cost,settings.currency)}</div></div></div>
            <div className="panel chart-panel"><h2>Daily energy by device</h2><p>Estimated kWh per day</p><div className="chart-bars">{appliances.map(x=><div className="chart-row" key={x.id}><span>{x.name}</span><div className="chart-track"><div className="chart-fill" style={{width:(energy(x)/Math.max(...appliances.map(y=>energy(y)),0.01)*100)+'%'}}/></div><b>{energy(x).toFixed(2)} kWh</b></div>)}</div></div>
            <div className="panel chart-panel"><h2>Rated wattage comparison</h2><p>Rated power, not continuous consumption</p><div className="chart-bars">{[...appliances].sort((x,y)=>y.watts-x.watts).map(x=><div className="chart-row" key={x.id}><span>{x.name}</span><div className="chart-track"><div className="chart-fill watt-fill" style={{width:(x.watts/Math.max(...appliances.map(y=>y.watts),1)*100)+'%'}}/></div><b>{x.watts} W</b></div>)}</div></div>
          </>}
          {page === 'Profile' && <>
            <div className={'role-profile role-'+profile.toLowerCase().replace(/\\s+/g,'-')}>
              <div className="role-kicker">PERSONAL ACCOUNT · {profile.toUpperCase()}</div>
              <div className="profile-hero-row">
                <div className="avatar-large">{userProfile.avatar?<img src={userProfile.avatar} alt="Profile avatar"/>:<span>{userProfile.name.trim().charAt(0).toUpperCase()||'U'}</span>}</div>
                <div><h1>{userProfile.name||'Your profile'}</h1><p>@{userProfile.username} · {profile}</p><span className="role-pill">{profile==='Family Head'?'Family administrator':profile==='Landlord'?'Property manager':'Personal energy dashboard'}</span></div>
              </div>
            </div>
            <div className="panel profile-edit-panel"><div className="profile-panel-title"><div><h2>Personalize your profile</h2><p>Set your display name, unique username, picture, and contact email.</p></div></div>
              <form className="profile-form" onSubmit={e=>{e.preventDefault();const clean=userProfile.username.trim().replace(/^@/,'');if(!clean){alert('Choose a username.');return;}if(!usernameAvailable(clean)){alert('That username is already used in this browser. Choose a unique one.');return;}setUserProfile(p=>({...p,name:p.name.trim()||'Home User',email:p.email.trim()}));alert('Profile saved. Your WattWise username is assigned by the app and cannot be changed.');}}>
                <label>Display name<input required value={userProfile.name} onChange={e=>setUserProfile(p=>({...p,name:e.target.value}))} placeholder="Your full name"/></label>
                <label>App-assigned username<input value={userProfile.username} readOnly aria-readonly="true"/><small>Assigned automatically by WattWise and cannot be edited. Customize your display name instead.</small></label>
                <label>Email address (optional)<input type="email" value={userProfile.email} onChange={e=>setUserProfile(p=>({...p,email:e.target.value}))} placeholder="you@example.com"/></label>
                <label className="avatar-upload-label">Profile picture<input type="file" accept="image/*" onChange={e=>handleAvatar(e.target.files?.[0])}/><small>Choose an image up to 2 MB. It stays in this browser.</small></label>
                <button className="primary-btn">Save profile</button>
              </form>
            </div>
            <div className="panel role-choice-panel"><h2>Choose how you use WattWise</h2><p>Your role changes the navigation and management tools shown in the app.</p><div className="profile-switch"><button className={profile==='Casual User'?'profile-option selected role-casual':'profile-option role-casual'} onClick={()=>setProfile('Casual User')}><Home/><b>Casual User</b><span>One personal home and energy estimates.</span></button><button className={profile==='Family Head'?'profile-option selected role-family':'profile-option role-family'} onClick={()=>setProfile('Family Head')}><Users/><b>Family Head</b><span>Manage family member profiles and their membership list.</span></button><button className={profile==='Landlord'?'profile-option selected role-landlord':'profile-option role-landlord'} onClick={()=>setProfile('Landlord')}><Building2/><b>Landlord</b><span>Manage residences and add residents to each property.</span></button></div></div>
            {profile==='Family Head'&&<div className="panel residence-panel"><h2>My Family</h2><p className="panel-subtitle">Add household members with their own unique usernames.</p><form className="member-form" onSubmit={e=>{e.preventDefault();const username=makeUsername();setMembers(old=>[...old,{id:crypto.randomUUID(),name:memberName.trim(),username,email:memberEmail.trim(),role:memberRole,avatar:''}]);setMemberName('');setMemberUsername('');setMemberEmail('');}}><input required value={memberName} onChange={e=>setMemberName(e.target.value)} placeholder="Family member name"/><input required value={memberUsername} onChange={e=>setMemberUsername(e.target.value.replace(/\\s/g,''))} placeholder="Unique username"/><input type="email" value={memberEmail} onChange={e=>setMemberEmail(e.target.value)} placeholder="Email (optional)"/><select value={memberRole} onChange={e=>setMemberRole(e.target.value)}><option>Family member</option><option>Adult</option><option>Child</option><option>Guest</option></select><button className="primary-btn">Add family member</button></form><div className="member-list">{members.map(m=><div className="member-row" key={m.id}><div className="member-avatar">{m.avatar?<img src={m.avatar} alt=""/>:m.name.charAt(0).toUpperCase()}</div><div className="member-details"><b>{m.name}</b><small>@{m.username} · {m.role}{m.email?' · '+m.email:''}</small></div><button type="button" className="remove-residence" onClick={()=>setMembers(old=>old.filter(x=>x.id!==m.id))}>Remove</button></div>)}{members.length===0&&<p className="empty-members">No members added yet. Add your first family member above.</p>}</div></div>}
            {profile==='Landlord'&&<div className="panel residence-panel"><h2>Manage residences</h2><form className="residence-form" onSubmit={e=>{e.preventDefault();if(residenceName.trim()){setResidences(old=>[...old,{id:crypto.randomUUID(),name:residenceName.trim(),address:residenceAddress.trim(),residents:[]}]);setResidenceName('');setResidenceAddress('')}}}><input required value={residenceName} onChange={e=>setResidenceName(e.target.value)} placeholder="Residence / property name"/><input value={residenceAddress} onChange={e=>setResidenceAddress(e.target.value)} placeholder="Address or notes (optional)"/><button className="primary-btn">Add residence</button></form>{residences.map(r=><div className="residence-manager" key={r.id}><div className="residence-item"><div><b>{r.name}</b><small>{r.address||'No address added'} · {(r.residents||[]).length} residents</small></div><button className="remove-residence" onClick={()=>setResidences(old=>old.filter(x=>x.id!==r.id))}>Remove property</button></div><form className="resident-form" onSubmit={e=>{e.preventDefault();const username=makeUsername();const newMember:Member={id:crypto.randomUUID(),name:residentName.trim(),username,email:residentEmail.trim(),role:'Resident',avatar:''};setResidences(old=>old.map(x=>x.id===r.id?{...x,residents:[...(x.residents||[]),newMember]}:x));setResidentName('');setResidentUsername('');setResidentEmail('');setSelectedResidence(r.id);}}><input required value={selectedResidence===r.id?residentName:''} onChange={e=>{setSelectedResidence(r.id);setResidentName(e.target.value)}} placeholder="Resident name"/><input required value={selectedResidence===r.id?residentUsername:''} onChange={e=>{setSelectedResidence(r.id);setResidentUsername(e.target.value.replace(/\\s/g,''))}} placeholder="Unique username"/><input type="email" value={selectedResidence===r.id?residentEmail:''} onChange={e=>{setSelectedResidence(r.id);setResidentEmail(e.target.value)}} placeholder="Resident email (optional)"/><button className="primary-btn">Add resident</button></form>{(r.residents||[]).map(m=><div className="member-row" key={m.id}><div className="member-avatar">{m.name.charAt(0).toUpperCase()}</div><div className="member-details"><b>{m.name}</b><small>@{m.username} · Resident</small></div><button type="button" className="remove-residence" onClick={()=>setResidences(old=>old.map(x=>x.id===r.id?{...x,residents:(x.residents||[]).filter(y=>y.id!==m.id)}:x))}>Remove resident</button></div>)}</div>)}</div>}
            <div className="catalog-note"><CircleHelp size={17}/> These are local profile and membership tools stored in this browser, not secure online accounts. Family members and residents do not yet have separate sign-ins or access from their own devices. For a production multi-user service, connect verified authentication and a shared database.</div>
          </>}
          {page === 'My Family' && profile==='Family Head' && <><div className="page-intro"><div className="eyebrow">HOUSEHOLD MANAGEMENT</div><h1>My <em>Family.</em></h1><p>Manage your household's member list and unique usernames.</p></div><div className="panel residence-panel"><h2>Family members · {members.length}</h2>{members.map(m=><div className="member-row" key={m.id}><div className="member-avatar">{m.name.charAt(0).toUpperCase()}</div><div className="member-details"><b>{m.name}</b><small>@{m.username} · {m.role}</small></div></div>)}{members.length===0&&<p className="empty-members">No members yet. Open Profile to add your family.</p>}<button className="primary-btn" onClick={()=>setPage('Profile')}>Manage family</button></div></>}
          {page === 'Residencies' && profile==='Landlord' && <><div className="page-intro"><div className="eyebrow">PROPERTY MANAGEMENT</div><h1>My <em>Residencies.</em></h1><p>Manage properties, residents, and their unique usernames.</p></div><div className="panel residence-panel"><h2>{residences.length} properties · {residences.reduce((sum,r)=>sum+(r.residents||[]).length,0)} residents</h2>{residences.map(r=><div className="residence-item" key={r.id}><div><b>{r.name}</b><small>{r.address||'No address added'} · {(r.residents||[]).length} residents</small></div><button className="remove-residence" onClick={()=>setPage('Profile')}>Manage</button></div>)}<button className="primary-btn" onClick={()=>setPage('Profile')}>Manage properties</button></div></>}
          {page === 'Help & AI' && <>
            <div className="page-intro"><div className="eyebrow">YOUR ENERGY-SAVING ASSISTANT</div><h1>Ask WattWise <em>AI.</em></h1><p>Ask about bills, solar offsets, watts, efficient settings, and electrical safety.</p></div>
            <div className="chat-panel"><div className="chat-header"><b>WattWise Energy Assistant</b><span className="online-dot"/></div><div className="chat-messages">{chatMessages.map((m,i)=><div key={i} className={m.role==='user'?'chat-message user-message':'chat-message assistant-message'}>{m.text}</div>)}{chatBusy&&<div className="chat-message assistant-message">Thinking…</div>}</div><form className="chat-form" onSubmit={async e=>{e.preventDefault();const q=chatInput.trim();if(!q||chatBusy)return;setChatMessages(old=>[...old,{role:'user',text:q}]);setChatInput('');setChatBusy(true);try{const res=await fetch('/api/energy-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,context:{dailyKwh:totals.daily,monthlyKwh:totals.monthly,estimatedNetBill:totals.cost,currency:settings.currency,solarKwh:settings.solarKwh,solarOffset:settings.solarOffset,appliances:appliances.map(x=>({name:x.name,category:x.category,watts:x.watts,hours:x.hours}))}})});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(String(data?.error||'Request failed'));setChatMessages(old=>[...old,{role:'assistant',text:String(data?.answer||'Please try again.')}]);}catch{setChatMessages(old=>[...old,{role:'assistant',text:'The assistant is temporarily unavailable. Please email aaravaltswimmer@gmail.com.'}]);}finally{setChatBusy(false)}}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Ask about solar, bills, watts…"/><button className="primary-btn" disabled={chatBusy||!chatInput.trim()}>Ask</button></form></div>
            <div className="support-card"><div><b>Customer support</b><p>Contact us for help using WattWise.</p></div><a className="primary-btn" href="mailto:aaravaltswimmer@gmail.com?subject=WattWise%20Support">Email support</a></div>
          </>}
          <div className="page-intro">
            <div className="eyebrow">MAKE THE NUMBERS YOURS</div>
            <h1>
              Home <em>settings.</em>
            </h1>
            <p>
              Enter your usual electricity bill and local rate to make estimates
              more useful.
            </p>
          </div>
          <form
            className="settings-card"
            onSubmit={e => {
              e.preventDefault();
              localStorage.setItem('ww-settings', JSON.stringify(settings));
              setSaved(true);
              setTimeout(() => setSaved(false), 2200);
            }}
          >
            <div className="settings-title">
              <div className="stat-icon peach">
                <IndianRupee size={20} />
              </div>
              <div>
                <h2>Electricity bill & tariff</h2>
                <p>Use a recent bill for the best estimate.</p>
              </div>
            </div>
            <label>
              Average monthly electricity bill
              <div className="input-with-prefix">
                <span>
                  {settings.currency === 'INR'
                    ? '₹'
                    : settings.currency === 'USD'
                      ? '$'
                      : settings.currency === 'GBP'
                        ? '£'
                        : '€'}
                </span>
                <input
                  type="number"
                  min="0"
                  value={settings.bill}
                  onChange={e =>
                    setSettings(s => ({
                      ...s,
                      bill: Math.max(0, Number(e.target.value)),
                    }))
                  }
                  required
                />
              </div>
            </label>
            <label>
              Solar energy used by your home per month (kWh)
              <input type="number" min="0" step="0.1" value={settings.solarKwh||0} onChange={e=>setSettings(s=>({...s,solarKwh:Math.max(0,Number(e.target.value)||0)}))}/>
              <small>Enter solar energy that offsets grid electricity each month.</small>
            </label>
            <label>
              Solar bill reduction (%)
              <input type="number" min="0" max="100" value={settings.solarOffset||0} onChange={e=>setSettings(s=>({...s,solarOffset:Math.min(100,Math.max(0,Number(e.target.value)||0))}))}/>
              <small>Estimated share of solar energy that reduces grid charges.</small>
            </label>
            <label>
              Electricity price per kWh
              <div className="input-with-prefix">
                <span>
                  {settings.currency === 'INR'
                    ? '₹'
                    : settings.currency === 'USD'
                      ? '$'
                      : settings.currency === 'GBP'
                        ? '£'
                        : '€'}
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={settings.rate}
                  onChange={e =>
                    setSettings(s => ({
                      ...s,
                      rate: Math.max(0.01, Number(e.target.value)),
                    }))
                  }
                  required
                />
              </div>
              <small>
                Check your bill for the effective per-unit charge. Taxes and
                fixed charges may make the final bill differ.
              </small>
            </label>
            <label>
              Currency
              <select
                value={settings.currency}
                onChange={e =>
                  setSettings(s => ({ ...s, currency: e.target.value }))
                }
              >
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="GBP">GBP — British Pound (£)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="AUD">AUD — Australian Dollar (A$)</option>
                <option value="CAD">CAD — Canadian Dollar (C$)</option>
              </select>
            </label>
            <div className="settings-preview">
              <div>
                <span>Estimated monthly usage cost</span>
                <b>{money(totals.cost, settings.currency)}</b>
              </div>
              <div>
                <span>Your entered bill</span>
                <b>{money(settings.bill, settings.currency)}</b>
              </div>
            </div>
            <button className="primary-btn save-settings" type="submit">
              Save settings <ChevronRight size={16} />
            </button>
            {saved && (
              <p className="success-msg">Settings saved on this device.</p>
            )}
          </form>
          <div className="catalog-note">
            <CircleHelp size={17} />
            <span>
              Energy estimates are based on power × hours. For variable-power
              appliances such as inverter ACs and refrigerators, actual
              consumption may vary significantly.
            </span>
          </div>
        </div>
        <footer className="footer">
          <span>© WattWise Home · <a href="mailto:aaravaltswimmer@gmail.com">aaravaltswimmer@gmail.com</a></span>
          <span>Customer support: <a href="mailto:aaravaltswimmer@gmail.com">aaravaltswimmer@gmail.com</a></span>
        </footer>
      </main>
      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <form className="appliance-modal" onSubmit={saveAppliance}>
            <div className="modal-head">
              <div>
                <span className="eyebrow">
                  {editing ? 'UPDATE YOUR DEVICE' : 'GROW YOUR HOME INVENTORY'}
                </span>
                <h2>{editing ? 'Edit appliance' : 'Add an appliance'}</h2>
                <p>
                  Don’t worry if you don’t know everything—you can edit this
                  later.
                </p>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <label>
              Appliance type
              <select
                value={form.category}
                onChange={e => {
                  const c = catalog.find(x => x.category === e.target.value);
                  setForm(f => ({
                    ...f,
                    category: e.target.value,
                    watts: String(c?.watts || 100),
                    setting: c?.setting || '',
                  }));
                }}
              >
                {catalog.map(c => (
                  <option key={c.category}>{c.category}</option>
                ))}
              </select>
            </label>
            <label>
              Friendly name
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Master bedroom AC"
              />
            </label>
            <div className="form-row">
              <label>
                Brand
                <input
                  value={form.brand}
                  onChange={e =>
                    setForm(f => ({ ...f, brand: e.target.value }))
                  }
                  placeholder="e.g. Samsung"
                />
              </label>
              <label>
                Model / version
                <input
                  value={form.model}
                  onChange={e =>
                    setForm(f => ({ ...f, model: e.target.value }))
                  }
                  placeholder="e.g. model number"
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Power rating (watts)
                <input
                  type="number"
                  min="1"
                  value={form.watts}
                  onChange={e =>
                    setForm(f => ({ ...f, watts: e.target.value }))
                  }
                  required
                />
                <small>Usually on the label or manual.</small>
              </label>
              <label>
                Hours used per day
                <input
                  type="number"
                  min="0"
                  max="24"
                  step=".25"
                  value={form.hours}
                  onChange={e =>
                    setForm(f => ({ ...f, hours: e.target.value }))
                  }
                  required
                />
                <small>Use 0–24 hours.</small>
              </label>
            </div>
            <label>
              Current setting / notes
              <input
                value={form.setting}
                onChange={e =>
                  setForm(f => ({ ...f, setting: e.target.value }))
                }
                placeholder="e.g. 22°C, high fan"
              />
            </label>
            <div className="estimate-preview">
              <Zap size={18} />
              <div>
                <span>Estimated daily energy</span>
                <b>
                  {(
                    (Math.max(0, Number(form.watts) || 0) *
                      Math.min(24, Math.max(0, Number(form.hours) || 0))) /
                    1000
                  ).toFixed(2)}{' '}
                  kWh
                </b>
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="primary-btn">
                {editing ? 'Save changes' : 'Add to My Home'}{' '}
                <ChevronRight size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Home size={25} />
      </div>
      <h3>Your home is ready for its first device</h3>
      <p>Add an appliance to start estimating your energy use and savings.</p>
      <button className="primary-btn" onClick={onAdd}>
        <Plus size={17} /> Add an appliance
      </button>
    </div>
  );
}
export default App;
