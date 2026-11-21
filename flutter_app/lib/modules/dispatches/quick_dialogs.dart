import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/database/local_storage.dart';

class QuickAddDialogs {
  static Future<Map<String, dynamic>?> showAddTruck(BuildContext context) async {
    final truckCtrl = TextEditingController();
    final ownerCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    return showDialog<Map<String, dynamic>>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add New Fleet Truck', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: SizedBox(
          width: 380,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: truckCtrl, textCapitalization: TextCapitalization.characters, decoration: const InputDecoration(labelText: 'Truck Number (e.g. RJ07GE0525)')),
              const SizedBox(height: 12),
              TextField(controller: ownerCtrl, decoration: const InputDecoration(labelText: 'Truck Owner / Transporter Name')),
              const SizedBox(height: 12),
              TextField(controller: phoneCtrl, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Owner Phone Number')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (truckCtrl.text.trim().isEmpty) return;
              final data = {
                'id': 'truck_${DateTime.now().millisecondsSinceEpoch}',
                'truckNo': truckCtrl.text.trim().toUpperCase(),
                'ownerName': ownerCtrl.text.trim().isEmpty ? 'Direct Owner' : ownerCtrl.text.trim(),
                'phone': phoneCtrl.text.trim(),
              };
              try {
                await ApiClient().post('/masters/trucks', data: data);
              } catch (_) {
                await LocalStorage().queueOfflineAction('trucks', 'CREATE', data);
              }
              Navigator.pop(ctx, data);
            },
            child: const Text('Save Truck'),
          ),
        ],
      ),
    );
  }

  static Future<Map<String, dynamic>?> showAddSource(BuildContext context) async {
    final nameCtrl = TextEditingController();
    final cityCtrl = TextEditingController();
    return showDialog<Map<String, dynamic>>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Booking Source', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: SizedBox(
          width: 380,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Source Station Name (e.g. AKAL SAHAYE AGRO)')),
              const SizedBox(height: 12),
              TextField(controller: cityCtrl, decoration: const InputDecoration(labelText: 'Location / City (Optional)')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (nameCtrl.text.trim().isEmpty) return;
              final data = {
                'id': 'src_${DateTime.now().millisecondsSinceEpoch}',
                'name': nameCtrl.text.trim(),
                'city': cityCtrl.text.trim(),
              };
              try {
                await ApiClient().post('/masters/sources', data: data);
              } catch (_) {
                await LocalStorage().queueOfflineAction('sources', 'CREATE', data);
              }
              Navigator.pop(ctx, data);
            },
            child: const Text('Save Source'),
          ),
        ],
      ),
    );
  }

  static Future<Map<String, dynamic>?> showAddDestination(BuildContext context) async {
    final destCtrl = TextEditingController();
    final distCtrl = TextEditingController();
    return showDialog<Map<String, dynamic>>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Destination Place', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: SizedBox(
          width: 380,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: destCtrl, decoration: const InputDecoration(labelText: 'Destination / Mill Name (e.g. Baddi, HP)')),
              const SizedBox(height: 12),
              TextField(controller: distCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Distance (KM, Optional)')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (destCtrl.text.trim().isEmpty) return;
              final data = {
                'id': 'dest_${DateTime.now().millisecondsSinceEpoch}',
                'name': destCtrl.text.trim(),
                'distance': int.tryParse(distCtrl.text) ?? 0,
              };
              try {
                await ApiClient().post('/masters/destinations', data: data);
              } catch (_) {
                await LocalStorage().queueOfflineAction('destinations', 'CREATE', data);
              }
              Navigator.pop(ctx, data);
            },
            child: const Text('Save Destination'),
          ),
        ],
      ),
    );
  }
}
