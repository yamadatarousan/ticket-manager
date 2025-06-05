import React, { useState, useEffect } from 'react';
import { SystemSetting, SystemSettingRequest } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * システム設定管理画面コンポーネント
 * 
 * 管理者のみがアクセス可能なシステム設定の管理画面です。
 * 各種設定項目の表示、編集、新規作成、削除機能を提供します。
 */
export const SystemSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingSettings, setEditingSettings] = useState<Record<number, boolean>>({});
  const [editValues, setEditValues] = useState<Record<number, string>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSetting, setNewSetting] = useState<SystemSettingRequest>({
    key: '',
    value: '',
    description: '',
    setting_type: 'string',
    is_public: false
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchSettings();
    }
  }, [user?.role]);

  // 権限チェック
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <h2 className="text-lg font-medium">アクセス権限がありません</h2>
          <p className="text-sm mt-1">この機能にアクセスするには管理者権限が必要です。</p>
        </div>
      </div>
    );
  }

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getSystemSettings();
      setSettings(response.system_settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'システム設定の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (setting: SystemSetting) => {
    setEditingSettings(prev => ({ ...prev, [setting.id]: true }));
    setEditValues(prev => ({ ...prev, [setting.id]: setting.value }));
  };

  const handleSave = async (setting: SystemSetting) => {
    try {
      const newValue = editValues[setting.id];
      await apiService.updateSystemSetting(setting.id, { value: newValue });
      
      setEditingSettings(prev => ({ ...prev, [setting.id]: false }));
      setSuccess('設定を更新しました');
      await fetchSettings();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定の更新に失敗しました');
    }
  };

  const handleCancel = (settingId: number) => {
    setEditingSettings(prev => ({ ...prev, [settingId]: false }));
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[settingId];
      return newValues;
    });
  };

  const handleDelete = async (setting: SystemSetting) => {
    if (!window.confirm(`設定「${setting.key}」を削除しますか？`)) {
      return;
    }

    try {
      await apiService.deleteSystemSetting(setting.id);
      setSuccess('設定を削除しました');
      await fetchSettings();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定の削除に失敗しました');
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!newSetting.key.trim()) {
      errors.push('設定キーは必須です');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(newSetting.key)) {
      errors.push('設定キーは英数字、アンダースコア（_）、ハイフン（-）のみ使用可能です');
    }
    
    if (!newSetting.value.trim()) {
      errors.push('設定値は必須です');
    }
    
    return errors;
  };

  const handleCreate = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }
    
    try {
      await apiService.createSystemSetting(newSetting);
      setSuccess('新しい設定を作成しました');
      setShowCreateForm(false);
      setNewSetting({
        key: '',
        value: '',
        description: '',
        setting_type: 'string',
        is_public: false
      });
      await fetchSettings();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('設定作成エラー:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('設定の作成に失敗しました');
      }
    }
  };

  const getSettingTypeLabel = (type: string) => {
    switch (type) {
      case 'string': return '文字列';
      case 'integer': return '整数';
      case 'boolean': return '真偽値';
      case 'json': return 'JSON';
      default: return type;
    }
  };

  const formatDisplayValue = (setting: SystemSetting): string => {
    // 表示用の値を整形
    if (setting.setting_type === 'boolean') {
      return setting.value === 'true' ? '有効' : '無効';
    }
    
    return setting.value;
  };

  const renderSettingValue = (setting: SystemSetting) => {
    if (editingSettings[setting.id]) {
      if (setting.setting_type === 'boolean') {
        return (
          <select
            value={editValues[setting.id]}
            onChange={(e) => setEditValues(prev => ({ ...prev, [setting.id]: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="true">有効</option>
            <option value="false">無効</option>
          </select>
        );
      }
      
      return (
        <input
          type={setting.setting_type === 'integer' ? 'number' : 'text'}
          value={editValues[setting.id]}
          onChange={(e) => setEditValues(prev => ({ ...prev, [setting.id]: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      );
    }

    return formatDisplayValue(setting);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">設定を読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          システム設定
        </h1>
        <p className="text-gray-600">
          アプリケーション全体の設定を管理します。変更は即座に反映されます。
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="text-sm whitespace-pre-line">{error}</div>
          <button 
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 text-xs mt-2"
          >
            ✕ 閉じる
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <p className="text-sm">{success}</p>
          <button 
            onClick={() => setSuccess(null)}
            className="text-green-500 hover:text-green-700 text-xs mt-1"
          >
            ✕ 閉じる
          </button>
        </div>
      )}

      {/* 新規作成ボタン */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          {showCreateForm ? 'キャンセル' : '新しい設定を追加'}
        </button>
      </div>

      {/* 新規作成フォーム */}
      {showCreateForm && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">新しい設定を作成</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">設定キー</label>
              <input
                type="text"
                value={newSetting.key}
                onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                placeholder="例: max_file_size"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                英数字、アンダースコア（_）、ハイフン（-）のみ使用可能
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">設定値</label>
              <input
                type="text"
                value={newSetting.value}
                onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                placeholder="例: 10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">設定の型</label>
              <select
                value={newSetting.setting_type}
                onChange={(e) => setNewSetting(prev => ({ ...prev, setting_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="string">文字列</option>
                <option value="integer">整数</option>
                <option value="boolean">真偽値</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newSetting.is_public}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">公開設定</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <input
                type="text"
                value={newSetting.description}
                onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                placeholder="設定の説明"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleCreate}
              disabled={!newSetting.key.trim() || !newSetting.value.trim() || !/^[a-zA-Z0-9_-]+$/.test(newSetting.key)}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium"
            >
              作成
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 設定一覧 */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">設定一覧</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  設定キー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  設定値
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  説明
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  公開
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settings.map((setting) => (
                <tr key={setting.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{setting.key}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {renderSettingValue(setting)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs">
                      {setting.description || '説明なし'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {getSettingTypeLabel(setting.setting_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      setting.is_public 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {setting.is_public ? '公開' : '非公開'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingSettings[setting.id] ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSave(setting)}
                          className="text-green-600 hover:text-green-900"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => handleCancel(setting.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(setting)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(setting)}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 