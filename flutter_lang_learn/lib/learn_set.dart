import 'package:flutter/material.dart';
import 'package:flutter_lang_learn/search_bar.dart';
import 'package:http/http.dart' as http;
import 'package:html/parser.dart' as parser;

class LearnExpression {
  LearnExpression({required this.value})
      : visited = 0,
        correct = 0;

  String value;
  int visited;
  int correct;
}

class LearnPair {
  LearnPair({required this.term, required this.definition});

  LearnExpression term;
  LearnExpression definition;
}

class LearnSet {
  LearnSet() : pairs = [];

  List<LearnPair> pairs;
  String? title;
  String? author;
  String? url;

  void addPair(LearnPair pair, {bool noDublicates = true}) {
    if (noDublicates && pairs.contains(pair)) return;
    pairs.add(pair);
  }
}

class QuizletHandler {
  Future<String> download(String url) async {
    var uri = Uri.tryParse(url);

    if (uri == null || uri.scheme != 'https') {
      throw 'Invalid URL';
    }

    if (uri.host != 'quizlet.com') {
      throw '${uri.host} is not supported';
    }

    var response = await http.get(uri);
    switch (response.statusCode) {
      case 200:
        return response.body;
      default:
        return '';
    }
  }

  LearnSet parse(String data) {
    var learnSet = LearnSet();
    var document = parser.parse(data);

    learnSet.author = document.querySelector('.UserLink-username')?.innerHtml;
    learnSet.title =
        document.querySelector('.SetPage-titleWrapper h1')?.innerHtml;

    var pairs = document.querySelectorAll('.SetPageTerm-inner');

    for (var element in pairs) {
      var expressions = element.querySelectorAll('.TermText');
      var term = expressions[0].innerHtml;
      var definition = expressions[1].innerHtml;
      var pair = LearnPair(
          term: LearnExpression(value: term),
          definition: LearnExpression(value: definition));
      learnSet.addPair(pair);
    }

    return learnSet;
  }
}

class LearnSetPreview extends StatefulWidget {
  const LearnSetPreview(LearnSet learnSet, {super.key}) : _learnSet = learnSet;

  final LearnSet _learnSet;

  @override
  State<LearnSetPreview> createState() => LearnSetPreviewState();
}

class LearnSetPreviewState extends State<LearnSetPreview> {
  @override
  Widget build(BuildContext context) {
    if (widget._learnSet.author == null) {
      return Text('no author was given');
    }

    var title = widget._learnSet.title ?? 'no title';
    var author = widget._learnSet.author ?? 'no author';

    return Card(
        child: ListTile(
      onTap: () {},
      title: Text(title),
      subtitle: Text(author),
    ));
  }
}

class LearnSetDownloader extends StatefulWidget {
  const LearnSetDownloader({super.key});

  @override
  State<LearnSetDownloader> createState() => _LearnSetDownloaderState();
}

class _LearnSetDownloaderState extends State<LearnSetDownloader> {
  QuizletHandler quizletHandler = QuizletHandler();
  Future<String>? data;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: SearchBar(onSearch: (url) {
            print('getting data...');
            setState(() {
              data = quizletHandler.download(url);
            });
          }),
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: FutureBuilder(
              builder: builder,
              future: data,
            ),
          ),
        )
      ],
    );
  }

  Widget builder(BuildContext context, AsyncSnapshot<String> snapshot) {
    var children = <Widget>[];

    if (snapshot.connectionState == ConnectionState.waiting) {
      return Center(
        child: SizedBox(
          width: 60,
          height: 60,
          child: CircularProgressIndicator(),
        ),
      );
    } else if (snapshot.hasData) {
      var learnSet = quizletHandler.parse(snapshot.data!);
      var preview = LearnSetPreview(learnSet);
      children.add(preview);
    } else if (snapshot.hasError) {
      children.add(Text(snapshot.error.toString()));
    }

    return Center(
      child: Column(
        children: children,
      ),
    );
  }
}
