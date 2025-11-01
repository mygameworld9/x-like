export type Language = 'en' | 'zh';

interface Translations {
  [key: string]: {
    [key: string]: string | { [key: string]: string };
  };
}

export const translations: Record<Language, any> = {
  en: {
    app: {
      title: 'Twitter Like Catcher',
      version: 'V2.0 - Dual Storage Edition'
    },
    header: {
      refresh: 'Refresh',
      settings: 'Settings'
    },
    statistics: {
      title: 'Statistics',
      totalCaptured: 'Total Captured',
      today: 'Today'
    },
    storage: {
      title: 'Storage Mode',
      localOnly: '📁 Local Only',
      supabase: '☁️ Supabase + Local',
      offline: 'Offline',
      synced: 'Synced',
      localDesc: 'Configure Supabase in settings to enable cloud sync',
      supabaseDesc: 'Data is backed up locally and synced to Supabase'
    },
    actions: {
      title: 'Actions',
      viewTweets: 'View & Select Tweets',
      exportAll: 'Export All to JSON',
      clearLocal: 'Clear Local Data'
    },
    tweets: {
      title: 'Tweets',
      back: 'Back',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      exportSelected: 'Export Selected',
      view: 'View'
    },
    settings: {
      title: 'Settings',
      supabaseUrl: 'Supabase URL',
      supabaseKey: 'Supabase Anon Key',
      language: 'Language',
      loading: 'Loading...',
      saving: 'Saving...',
      saved: 'Saved!',
      cancel: 'Cancel',
      save: 'Save',
      urlPlaceholder: 'https://your-project.supabase.co',
      keyPlaceholder: 'ey...'
    },
    alerts: {
      noDataToExport: 'No data to export',
      selectTweetsToExport: 'Please select tweets to export',
      clearConfirm: 'Clear all local data? This cannot be undone!',
      clearFailed: 'Failed to clear data',
      clearSuccess: 'Local data cleared!'
    },
    timeAgo: {
      years: 'y ago',
      months: 'mo ago',
      days: 'd ago',
      hours: 'h ago',
      minutes: 'm ago',
      seconds: 's ago'
    }
  },
  zh: {
    app: {
      title: 'Twitter 点赞收集器',
      version: 'V2.0 - 双存储版'
    },
    header: {
      refresh: '刷新',
      settings: '设置'
    },
    statistics: {
      title: '统计',
      totalCaptured: '总计收集',
      today: '今日'
    },
    storage: {
      title: '存储模式',
      localOnly: '📁 仅本地',
      supabase: '☁️ Supabase + 本地',
      offline: '离线',
      synced: '已同步',
      localDesc: '在设置中配置 Supabase 以启用云同步',
      supabaseDesc: '数据在本地备份并同步到 Supabase'
    },
    actions: {
      title: '操作',
      viewTweets: '查看和选择推文',
      exportAll: '导出全部为 JSON',
      clearLocal: '清除本地数据'
    },
    tweets: {
      title: '推文',
      back: '返回',
      selectAll: '全选',
      deselectAll: '取消全选',
      exportSelected: '导出选中',
      view: '查看'
    },
    settings: {
      title: '设置',
      supabaseUrl: 'Supabase URL',
      supabaseKey: 'Supabase 匿名密钥',
      language: '语言',
      loading: '加载中...',
      saving: '保存中...',
      saved: '已保存！',
      cancel: '取消',
      save: '保存',
      urlPlaceholder: 'https://your-project.supabase.co',
      keyPlaceholder: 'ey...'
    },
    alerts: {
      noDataToExport: '没有数据可导出',
      selectTweetsToExport: '请选择要导出的推文',
      clearConfirm: '清除所有本地数据？此操作无法撤销！',
      clearFailed: '清除数据失败',
      clearSuccess: '本地数据已清除！'
    },
    timeAgo: {
      years: '年前',
      months: '月前',
      days: '天前',
      hours: '小时前',
      minutes: '分钟前',
      seconds: '秒前'
    }
  }
};
