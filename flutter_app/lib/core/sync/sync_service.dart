import 'dart:async';
import 'package:flutter/foundation.dart';
import '../api/api_client.dart';
import '../database/local_storage.dart';

class SyncService extends ChangeNotifier {
  static final SyncService _instance = SyncService._internal();
  factory SyncService() => _instance;
  SyncService._internal() {
    _startHeartbeat();
  }

  bool _isOnline = false;
  bool _isSyncing = false;
  int _pendingCount = 0;
  String? _lastSyncedAt;
  Timer? _timer;

  bool get isOnline => _isOnline;
  bool get isSyncing => _isSyncing;
  int get pendingCount => _pendingCount;
  String? get lastSyncedAt => _lastSyncedAt;

  void _startHeartbeat() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => checkSyncStatus());
  }

  Future<void> checkSyncStatus() async {
    final queue = await LocalStorage().getOfflineQueue();
    _pendingCount = queue.length;

    try {
      final res = await ApiClient().get('/masters/trucks');
      if (res.statusCode == 200) {
        _isOnline = true;
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

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
