import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  static final LocalStorage _instance = LocalStorage._internal();
  factory LocalStorage() => _instance;
  LocalStorage._internal();

  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  // --- TRUCKS CACHE ---
  Future<void> saveTrucks(List<Map<String, dynamic>> trucks) async {
    await init();
    await _prefs?.setString('cached_trucks', jsonEncode(trucks));
  }

  Future<List<Map<String, dynamic>>> getTrucks() async {
    await init();
    final data = _prefs?.getString('cached_trucks');
    if (data == null) return [];
    try {
      final List decoded = jsonDecode(data);
      return decoded.map((e) => Map<String, dynamic>.from(e)).toList();
    } catch (_) {
      return [];
    }
  }

  // --- DISPATCHES CACHE ---
  Future<void> saveDispatches(List<Map<String, dynamic>> dispatches) async {
    await init();
    await _prefs?.setString('cached_dispatches', jsonEncode(dispatches));
  }

  Future<List<Map<String, dynamic>>> getDispatches() async {
    await init();
    final data = _prefs?.getString('cached_dispatches');
    if (data == null) return [];
    try {
      final List decoded = jsonDecode(data);
      return decoded.map((e) => Map<String, dynamic>.from(e)).toList();
    } catch (_) {
      return [];
    }
  }

  // --- OFFLINE OUTBOX QUEUE ---
  Future<void> queueOfflineAction(String entity, String action, Map<String, dynamic> payload) async {
    await init();
    final queue = await getOfflineQueue();
    queue.add({
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'entity': entity,
      'action': action,
      'payload': payload,
      'queued_at': DateTime.now().toIso8601String(),
    });
    await _prefs?.setString('offline_sync_queue', jsonEncode(queue));
  }

  Future<List<Map<String, dynamic>>> getOfflineQueue() async {
    await init();
    final data = _prefs?.getString('offline_sync_queue');
    if (data == null) return [];
    try {
      final List decoded = jsonDecode(data);
      return decoded.map((e) => Map<String, dynamic>.from(e)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> clearOfflineQueue() async {
    await init();
    await _prefs?.remove('offline_sync_queue');
  }
}

