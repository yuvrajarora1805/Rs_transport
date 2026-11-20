import 'package:flutter/foundation.dart';
import '../api/api_client.dart';
import '../database/local_storage.dart';

class SyncService extends ChangeNotifier {
  static final SyncService _instance = SyncService._internal();
  factory SyncService() => _instance;
  SyncService._internal();

  bool _isOnline = false;
  bool _isSyncing = false;
  int _pendingCount = 0;
  String? _lastSyncedAt;

  bool get isOnline => _isOnline;
  bool get isSyncing => _isSyncing;
  int get pendingCount => _pendingCount;
  String? get lastSyncedAt => _lastSyncedAt;

  Future<void> checkSyncStatus() async {
    final queue = await LocalStorage().getOfflineQueue();
    _pendingCount = queue.length;

    try {
      final res = await ApiClient().get('/sync/status');
      if (res.statusCode == 200 && res.data != null) {
        _isOnline = true;
        _lastSyncedAt = res.data['lastSyncedAt'];
      } else {
        _isOnline = false;
      }
    } catch (_) {
      _isOnline = false;
    }

    notifyListeners();
  }

  Future<bool> triggerSyncNow() async {
    if (_isSyncing) return false;
    _isSyncing = true;
    notifyListeners();

    try {
      final queue = await LocalStorage().getOfflineQueue();
      if (queue.isNotEmpty) {
        // Push queued local changes to backend
        for (final item in queue) {
          final entity = item['entity'];
          final payload = item['payload'];
          if (entity == 'dispatches') {
            await ApiClient().post('/dispatches', data: payload);
          } else if (entity == 'trips') {
            await ApiClient().post('/trips', data: payload);
          }
        }
        await LocalStorage().clearOfflineQueue();
      }

      // Trigger server-side sync reconciler
      await ApiClient().post('/sync/trigger');
      _lastSyncedAt = DateTime.now().toIso8601String();
      _pendingCount = 0;
      _isOnline = true;
      _isSyncing = false;
      notifyListeners();
      return true;
    } catch (_) {
      _isSyncing = false;
      notifyListeners();
      return false;
    }
  }
}
