import 'dart:io';
import 'package:dio/dio.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio dio;
  String _baseUrl = Platform.isAndroid ? 'http://10.0.2.2:4000' : 'http://127.0.0.1:4000';

  ApiClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: _baseUrl,
        connectTimeout: const Duration(seconds: 5),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Future: Attach JWT token from secure storage if logged in
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          // Graceful offline handler: network errors don't crash the client
          return handler.next(e);
        },
      ),
    );
  }

  void updateBaseUrl(String newUrl) {
    _baseUrl = newUrl;
    dio.options.baseUrl = newUrl;
  }

  String get baseUrl => _baseUrl;

  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters}) async {
    return dio.get<T>(path, queryParameters: queryParameters);
  }

  Future<Response<T>> post<T>(String path, {dynamic data}) async {
    return dio.post<T>(path, data: data);
  }

  Future<Response<T>> put<T>(String path, {dynamic data}) async {
    return dio.put<T>(path, data: data);
  }

  Future<Response<T>> delete<T>(String path) async {
    return dio.delete<T>(path);
  }
}

