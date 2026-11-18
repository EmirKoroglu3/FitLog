import { useCallback, useEffect, useState } from 'react';
import { Activity, Ban, ChevronLeft, ChevronRight, KeyRound, LockOpen, Salad, Search, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react';
import adminService, { type AdminStats, type AdminUser, type AdminUserPage } from '../services/adminService';
import { useConfirm } from '../components/ConfirmProvider';
import { useAuth } from '../store/AuthContext';
import { apiErrorMessage } from '../utils/apiError';
import './Admin.css';

const PAGE_SIZE = 20;

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

/** "3 gün önce" style; falls back to the date for older activity. */
function ago(iso?: string | null): string {
  if (!iso) return 'Hiç';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Bugün';
  if (days === 1) return 'Dün';
  if (days < 30) return `${days} gün önce`;
  return fmtDate(iso);
}

export function Admin() {
  const { user } = useAuth();
  const { confirm, toast } = useConfirm();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [data, setData] = useState<AdminUserPage | null>(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, u] = await Promise.all([adminService.stats(), adminService.users(query, page, PAGE_SIZE)]);
      setStats(s);
      setData(u);
    } catch (err) {
      setError(apiErrorMessage(err, 'Yönetim verileri yüklenemedi.'));
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Search after the user stops typing
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setQuery(search.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const run = async (target: AdminUser, action: () => Promise<{ message: string }>) => {
    setBusyId(target.id);
    try {
      const res = await action();
      toast(res.message, 'success');
      await load();
    } catch (err) {
      toast(apiErrorMessage(err, 'İşlem yapılamadı.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const toggleLock = async (u: AdminUser) => {
    if (u.isLocked) return run(u, () => adminService.unlock(u.id));
    const ok = await confirm({
      title: `${u.name} ${u.surname} askıya alınsın mı?`,
      message: 'Kullanıcı giriş yapamaz ve tüm cihazlarda oturumu kapanır. Verileri silinmez; istediğinde geri açabilirsin.',
      confirmText: 'Askıya al',
      danger: true,
    });
    if (ok) run(u, () => adminService.lock(u.id));
  };

  const sendReset = async (u: AdminUser) => {
    const ok = await confirm({
      title: 'Şifre sıfırlama e-postası gönderilsin mi?',
      message: `${u.email} adresine 1 saat geçerli bir sıfırlama bağlantısı gider.`,
      confirmText: 'Gönder',
    });
    if (ok) run(u, () => adminService.sendPasswordReset(u.id));
  };

  const remove = async (u: AdminUser) => {
    const ok = await confirm({
      title: `${u.name} ${u.surname} silinsin mi?`,
      message: `${u.email} hesabı ve tüm verileri (${u.workoutCount} antrenman, ${u.mealCount} öğün, ölçümler, hedefler) kalıcı olarak silinir. Bu işlem geri alınamaz.`,
      confirmText: 'Kalıcı olarak sil',
      danger: true,
    });
    if (ok) run(u, () => adminService.remove(u.id));
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const tiles = stats
    ? [
        { icon: Users, label: 'Toplam kullanıcı', value: stats.totalUsers },
        { icon: Activity, label: 'Son 7 günde aktif', value: stats.activeLast7Days },
        { icon: UserPlus, label: 'Bu hafta katılan', value: stats.newLast7Days },
        { icon: Ban, label: 'Askıda', value: stats.lockedUsers },
        { icon: ShieldCheck, label: 'Kayıtlı antrenman', value: stats.totalWorkouts },
        { icon: Salad, label: 'Kayıtlı öğün', value: stats.totalMeals },
      ]
    : [];

  return (
    <div className="admin-page">
      <div className="container">
        <header className="admin-header">
          <h1>
            <ShieldCheck size="1em" aria-hidden="true" /> Yönetim
          </h1>
          <p>Kullanıcıları görüntüle, askıya al, şifre sıfırlama e-postası gönder veya sil.</p>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        <section className="admin-stats" aria-label="Özet">
          {tiles.map(({ icon: Icon, label, value }) => (
            <div key={label} className="admin-stat card">
              <Icon size={20} aria-hidden="true" />
              <strong>{value.toLocaleString('tr-TR')}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="admin-users card">
          <div className="admin-users-head">
            <h2>Kullanıcılar {data && <small>({data.total})</small>}</h2>
            <div className="admin-search">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ad veya e-posta ara"
                aria-label="Kullanıcı ara"
              />
            </div>
          </div>

          {loading && !data ? (
            <div className="admin-loading">
              <div className="spinner"></div>
            </div>
          ) : data && data.items.length === 0 ? (
            <p className="admin-empty">{query ? `"${query}" ile eşleşen kullanıcı yok.` : 'Henüz kullanıcı yok.'}</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kullanıcı</th>
                    <th>Kayıt</th>
                    <th>Son aktivite</th>
                    <th>Antrenman</th>
                    <th>Öğün</th>
                    <th>Durum</th>
                    <th aria-label="İşlemler"></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((u) => {
                    const self = u.id === user?.id;
                    const protectedUser = self || u.isAdmin;
                    return (
                      <tr key={u.id} className={u.isLocked ? 'locked' : ''}>
                        <td>
                          <div className="admin-user">
                            <span className="admin-avatar" aria-hidden="true">
                              {(u.name || u.email).charAt(0).toLocaleUpperCase('tr-TR')}
                            </span>
                            <div>
                              <strong>
                                {u.name} {u.surname}
                                {self && <em> (sen)</em>}
                              </strong>
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{fmtDate(u.createdDate)}</td>
                        <td>{ago(u.lastActivity)}</td>
                        <td>{u.workoutCount}</td>
                        <td>{u.mealCount}</td>
                        <td>
                          {u.isAdmin ? (
                            <span className="badge admin">Yönetici</span>
                          ) : u.isLocked ? (
                            <span className="badge locked">Askıda</span>
                          ) : (
                            <span className="badge active">Aktif</span>
                          )}
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button
                              type="button"
                              className="admin-action"
                              onClick={() => sendReset(u)}
                              disabled={busyId === u.id}
                              title="Şifre sıfırlama e-postası gönder"
                              aria-label={`${u.email} için şifre sıfırlama e-postası gönder`}
                            >
                              <KeyRound size={16} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className={`admin-action ${u.isLocked ? 'unlock' : 'lock'}`}
                              onClick={() => toggleLock(u)}
                              disabled={protectedUser || busyId === u.id}
                              title={protectedUser ? 'Kendine veya yöneticiye uygulanamaz' : u.isLocked ? 'Askıyı kaldır' : 'Askıya al'}
                              aria-label={`${u.email} ${u.isLocked ? 'askıyı kaldır' : 'askıya al'}`}
                            >
                              {u.isLocked ? <LockOpen size={16} aria-hidden="true" /> : <Ban size={16} aria-hidden="true" />}
                            </button>
                            <button
                              type="button"
                              className="admin-action danger"
                              onClick={() => remove(u)}
                              disabled={protectedUser || busyId === u.id}
                              title={protectedUser ? 'Kendine veya yöneticiye uygulanamaz' : 'Kullanıcıyı sil'}
                              aria-label={`${u.email} sil`}
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {data && totalPages > 1 && (
            <nav className="admin-pager" aria-label="Sayfalar">
              <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1} aria-label="Önceki sayfa">
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} aria-label="Sonraki sayfa">
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}

export default Admin;
