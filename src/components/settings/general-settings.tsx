'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { GlassCard, GlassCardContent, GlassCardHeader } from '../glass-card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from '@/hooks/use-location';
import { useTheme } from '../providers/theme-provider';
import { supportedLanguages, useSettings, type Language } from '../providers/settings-provider';
import { pickLanguage } from '@/lib/i18n';
import { checkAzanPermissionStatus } from '@/hooks/use-azan-scheduler';
import { scheduleFridayKahfReminder } from '@/lib/friday-kahf-reminder';
import { NativeAzan, type AzanStatus } from '@/lib/native-azan';

const copy = {
  general: { ar: 'عام', en: 'General', fr: 'Général' },
  language: { ar: 'اللغة', en: 'Language', fr: 'Langue' },
  darkMode: { ar: 'الوضع الداكن', en: 'Dark Mode', fr: 'Mode sombre' },
  currentLocation: { ar: 'الموقع الحالي', en: 'Current Location', fr: 'Lieu actuel' },
  detectingLocation: { ar: 'جار تحديد الموقع...', en: 'Detecting location...', fr: 'Détection du lieu…' },
  updating: { ar: 'جاري...', en: 'Updating...', fr: 'Mise à jour…' },
  refresh: { ar: 'تحديث', en: 'Refresh', fr: 'Actualiser' },
  azanSound: { ar: 'صوت الأذان', en: 'Azan Sound', fr: 'Son de l’adhan' },
  fullAzan: { ar: 'صوت الأذان الكامل', en: 'Full azan sound', fr: 'Son complet de l’adhan' },
  silentOnly: { ar: 'إشعار صامت فقط', en: 'Silent notification only', fr: 'Notification silencieuse uniquement' },
  azanPermissions: { ar: 'صلاحيات الأذان', en: 'Azan Permissions', fr: 'Autorisations de l’adhan' },
  azanPermissionsReady: { ar: 'كل الصلاحيات الأساسية مفعلة', en: 'All core permissions are enabled', fr: 'Toutes les autorisations principales sont activées' },
  azanPermissionsDescription: { ar: 'فعل المطلوب فقط عند الحاجة', en: 'Enable only what is needed', fr: 'Activez uniquement ce qui est nécessaire' },
  notifications: { ar: 'التنبيهات', en: 'Notifications', fr: 'Notifications' },
  exactAlarm: { ar: 'منبهات دقيقة', en: 'Exact alarms', fr: 'Alarmes exactes' },
  battery: { ar: 'الخلفية والبطارية', en: 'Battery', fr: 'Batterie' },
  enable: { ar: 'تفعيل', en: 'Enable', fr: 'Activer' },
  open: { ar: 'فتح', en: 'Open', fr: 'Ouvrir' },
  checking: { ar: 'جاري الفحص...', en: 'Checking...', fr: 'Vérification…' },
  duhaPrayer: { ar: 'صلاة الضحى', en: 'Duha Prayer', fr: 'Prière de Duha' },
  duhaDescription: {
    ar: 'إظهار وقت صلاة الضحى (20 دقيقة بعد الشروق)',
    en: 'Show Duha prayer time (20 min after sunrise)',
    fr: 'Afficher l’heure de la prière de Duha (20 min après le lever du soleil)',
  },
  wakeChallenge: { ar: 'تحدي الاستيقاظ', en: 'Wake-up Challenge', fr: 'Défi du réveil' },
  wakeDescription: {
    ar: 'أكمل الآية لإيقاف أذان الفجر',
    en: 'Complete the verse to stop Fajr azan',
    fr: 'Complétez le verset pour arrêter l’adhan du Fajr',
  },
} satisfies Record<string, Record<Language, string>>;

export function GeneralSettings() {
  const { theme, setTheme } = useTheme();
  const { settings, setLanguage, setAzanMode, setIncludeIshraq, setFajrQuizEnabled } = useSettings();
  const { displayName, refreshLocation, isLoading } = useLocation();
  const t = useCallback((key: keyof typeof copy) => pickLanguage(settings.language, copy[key]), [settings.language]);
  const [azanStatus, setAzanStatus] = useState<AzanStatus | null>(null);
  const [isCheckingAzanStatus, setIsCheckingAzanStatus] = useState(false);

  const refreshAzanStatus = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    setIsCheckingAzanStatus(true);
    try {
      setAzanStatus(await checkAzanPermissionStatus());
    } catch {
      setAzanStatus(null);
    } finally {
      setIsCheckingAzanStatus(false);
    }
  }, []);

  useEffect(() => {
    void refreshAzanStatus();

    let didUnmount = false;
    let removeListener: (() => void) | undefined;
    void App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) void refreshAzanStatus();
    }).then(listener => {
      if (didUnmount) {
        void listener.remove();
        return;
      }
      removeListener = () => {
        void listener.remove();
      };
    });

    return () => {
      didUnmount = true;
      removeListener?.();
    };
  }, [refreshAzanStatus]);

  const requestNotifications = async () => {
    await LocalNotifications.requestPermissions();
    await scheduleFridayKahfReminder(settings);
    await refreshAzanStatus();
  };

  const requestExactAlarm = async () => {
    await NativeAzan.requestExactAlarmPermission();
  };

  const openBatterySettings = async () => {
    await NativeAzan.openBatteryOptimizationSettings();
  };

  const needsAzanPermissions = useMemo(() => Boolean(
    azanStatus && (!azanStatus.notifications || !azanStatus.exactAlarm || !azanStatus.ignoringBatteryOptimizations)
  ), [azanStatus]);

  return (
    <GlassCard>
      <GlassCardHeader>
        <h2 className="text-base font-semibold">{t('general')}</h2>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between py-3 first:pt-0">
            <Label htmlFor="language-select" className="text-sm">{t('language')}</Label>
            <Select value={settings.language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger id="language-select" className="h-9 w-40 rounded-lg" dir="ltr">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map(language => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-3">
            <Label htmlFor="dark-mode-switch" className="text-sm">{t('darkMode')}</Label>
            <Switch
              id="dark-mode-switch"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              dir="ltr"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-0.5">
              <Label className="text-sm">{t('currentLocation')}</Label>
              <p className="text-[11px] text-muted-foreground">
                {displayName || t('detectingLocation')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-xs"
              onClick={() => refreshLocation()}
              disabled={isLoading}
            >
              {isLoading ? t('updating') : t('refresh')}
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-0.5">
              <Label className="text-sm">{t('azanSound')}</Label>
              <p className="text-[11px] text-muted-foreground">
                {settings.azanMode === 'full' ? t('fullAzan') : t('silentOnly')}
              </p>
            </div>
            <Switch
              id="azan-mode-switch"
              checked={settings.azanMode === 'full'}
              onCheckedChange={(checked) => setAzanMode(checked ? 'full' : 'silent')}
              dir="ltr"
            />
          </div>

          {Capacitor.isNativePlatform() && (
            <div className="flex items-start justify-between gap-3 py-3">
              <div className="flex flex-col gap-1">
                <Label className="text-sm">{t('azanPermissions')}</Label>
                <p className="text-[11px] text-muted-foreground">
                  {isCheckingAzanStatus
                    ? t('checking')
                    : needsAzanPermissions
                      ? t('azanPermissionsDescription')
                      : azanStatus ? t('azanPermissionsReady') : t('azanPermissionsDescription')}
                </p>
                {needsAzanPermissions && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {!azanStatus?.notifications && (
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => void requestNotifications()}>
                        {t('enable')} {t('notifications')}
                      </Button>
                    )}
                    {!azanStatus?.exactAlarm && (
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => void requestExactAlarm()}>
                        {t('open')} {t('exactAlarm')}
                      </Button>
                    )}
                    {!azanStatus?.ignoringBatteryOptimizations && (
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => void openBatterySettings()}>
                        {t('open')} {t('battery')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" className="h-8 shrink-0 rounded-lg text-xs" onClick={() => void refreshAzanStatus()} disabled={isCheckingAzanStatus}>
                {t('refresh')}
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-0.5">
              <Label className="text-sm">{t('duhaPrayer')}</Label>
              <p className="text-[11px] text-muted-foreground">{t('duhaDescription')}</p>
            </div>
            <Switch id="ishraq-switch" checked={settings.includeIshraq} onCheckedChange={setIncludeIshraq} dir="ltr" />
          </div>

          <div className="flex items-center justify-between py-3 last:pb-0">
            <div className="flex flex-col gap-0.5">
              <Label className="text-sm">{t('wakeChallenge')}</Label>
              <p className="text-[11px] text-muted-foreground">{t('wakeDescription')}</p>
            </div>
            <Switch id="fajr-quiz-switch" checked={settings.fajrQuizEnabled} onCheckedChange={setFajrQuizEnabled} dir="ltr" />
          </div>
          {Capacitor.isNativePlatform() && settings.fajrQuizEnabled && (
            <div className="py-3">
              <Button variant="outline" className="w-full" onClick={() => void NativeAzan.requestChallengeOverlay()}>
                {settings.language === 'ar' ? 'السماح بالتحدي فوق التطبيقات' : 'Allow challenge over other apps'}
              </Button>
            </div>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
