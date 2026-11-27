import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';

class ApprovalsScreen extends StatefulWidget {
  const ApprovalsScreen({super.key});

  @override
  State<ApprovalsScreen> createState() => _ApprovalsScreenState();
}

class _ApprovalsScreenState extends State<ApprovalsScreen> {
  List<Map<String, dynamic>> _pending = [];
  List<Map<String, dynamic>> _logs = [];
  List<Map<String, dynamic>> _users = [];
  bool _loading = true;
  int _tabIndex = 0;

  final _usernameCtrl = TextEditingController();
  final _fullNameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  String _selectedRole = 'MANAGER';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final pRes = await ApiClient().get('/approvals/pending');
      final lRes = await ApiClient().get('/activity-logs?limit=100');
      final uRes = await ApiClient().get('/auth/users');
      if (mounted) {
        final pData = pRes.data is Map ? pRes.data as Map : {};
        final combined = <Map<String, dynamic>>[
          ...List<Map<String, dynamic>>.from(pData['dispatches'] ?? []),
          ...List<Map<String, dynamic>>.from(pData['trips'] ?? []),
          ...List<Map<String, dynamic>>.from(pData['sources'] ?? []),
        ];
        setState(() {
          _pending = combined;
          _logs = lRes.data is List ? List<Map<String, dynamic>>.from(lRes.data) : [];
          _users = uRes.data is List ? List<Map<String, dynamic>>.from(uRes.data) : [];
        });
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _approve(String module, String id) async {
    await ApiClient().post('/approvals/$module/$id/approve', data: {});
    _loadData();
  }

  Future<void> _reject(String module, String id) async {
    await ApiClient().post('/approvals/$module/$id/reject', data: {'reason': 'Rejected by Admin'});
    _loadData();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const ERPHeader(
          title: 'Approvals & Activity',
          subtitle: 'Review Manager Entries & Monitor Activity Logs',
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              ChoiceChip(
                label: Text('Pending (${_pending.length})'),
                selected: _tabIndex == 0,
                onSelected: (_) => setState(() => _tabIndex = 0),
              ),
              const SizedBox(width: 8),
              ChoiceChip(
                label: Text('Activity (${_logs.length})'),
                selected: _tabIndex == 1,
                onSelected: (_) => setState(() => _tabIndex = 1),
              ),
              const SizedBox(width: 8),
              ChoiceChip(
                label: Text('Users (${_users.length})'),
                selected: _tabIndex == 2,
                onSelected: (_) => setState(() => _tabIndex = 2),
              ),
            ],
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _tabIndex == 0
                  ? _buildPendingList()
                  : _tabIndex == 1
                      ? _buildActivityList()
                      : _buildUsersTab(),
        ),
      ],
    );
  }

  Widget _buildPendingList() {
    if (_pending.isEmpty) {
      return const Center(
        child: Text('No pending manager entries', style: TextStyle(color: AppColors.textMuted)),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _pending.length,
      itemBuilder: (ctx, i) {
        final item = _pending[i];
        final module = item['module']?.toString() ?? 'dispatches';
        final id = item['id']?.toString() ?? '';
        return Card(
          margin: const EdgeInsets.only(bottom: 10),
          child: ListTile(
            title: Text('${module.toUpperCase()} • ${item['ref_no'] ?? id}'),
            subtitle: Text('${item['title'] ?? ''}'),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.check_circle, color: AppColors.success),
                  onPressed: () => _approve(module, id),
                ),
                IconButton(
                  icon: const Icon(Icons.cancel, color: AppColors.danger),
                  onPressed: () => _reject(module, id),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildActivityList() {
    if (_logs.isEmpty) {
      return const Center(
        child: Text('No manager activity recorded yet', style: TextStyle(color: AppColors.textMuted)),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _logs.length,
      itemBuilder: (ctx, i) {
        final log = _logs[i];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: const Icon(Icons.history, color: AppColors.primary),
            title: Text('${log['username']} • ${log['action']} (${log['module']})'),
            subtitle: Text(log['details']?.toString() ?? ''),
          ),
        );
      },
    );
  }

  Future<void> _createUser() async {
    if (_usernameCtrl.text.trim().isEmpty || _passwordCtrl.text.trim().length < 6) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Username required and password must be at least 6 characters')),
        );
      }
      return;
    }
    try {
      await ApiClient().post('/auth/users', data: {
        'username': _usernameCtrl.text.trim(),
        'fullName': _fullNameCtrl.text.trim(),
        'password': _passwordCtrl.text.trim(),
        'role': _selectedRole,
      });
      _usernameCtrl.clear();
      _fullNameCtrl.clear();
      _passwordCtrl.clear();
      _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to create user (username may already exist): $e')),
        );
      }
    }
  }

  Widget _buildUsersTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Create User', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 10),
                TextField(controller: _usernameCtrl, decoration: const InputDecoration(labelText: 'Username', border: OutlineInputBorder())),
                const SizedBox(height: 8),
                TextField(controller: _fullNameCtrl, decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder())),
                const SizedBox(height: 8),
                TextField(controller: _passwordCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder())),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: _selectedRole,
                  decoration: const InputDecoration(labelText: 'Role', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 'MANAGER', child: Text('MANAGER (Today & Yesterday only)')),
                    DropdownMenuItem(value: 'ADMIN', child: Text('ADMIN (Full Access)')),
                  ],
                  onChanged: (v) => setState(() => _selectedRole = v ?? 'MANAGER'),
                ),
                const SizedBox(height: 12),
                ElevatedButton(onPressed: _createUser, child: const Text('Create User')),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        ..._users.map((u) => Card(
          child: ListTile(
            leading: const Icon(Icons.person, color: AppColors.primary),
            title: Text(u['full_name']?.toString() ?? u['username']?.toString() ?? ''),
            subtitle: Text('@${u['username']}'),
            trailing: Chip(label: Text(u['role']?.toString() ?? 'MANAGER')),
          ),
        )),
      ],
    );
  }
}
