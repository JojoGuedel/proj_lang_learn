import 'package:flutter/material.dart';
import 'package:flutter_lang_learn/learn_set.dart';

void main() => runApp(const App());

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'lang_learn',
      darkTheme: ThemeData(
        brightness: Brightness.dark,
      ),
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      themeMode: ThemeMode.system,
      debugShowCheckedModeBanner: false,
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final QuizletHandler quizletDownloader = QuizletHandler();

  QuizletHandler _quizletHandler = QuizletHandler();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LearnSetDownloader(),
    );
  }
}
