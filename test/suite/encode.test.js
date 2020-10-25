//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// const vscode = require('vscode');
// const myExtension = require('../extension');

// Defines a Mocha test suite to group tests of similar kind together
suite("Encode Tests", function () {

    // Defines a Mocha unit test
    test("CodecUtil.escapeWithcrlf test", async function () {

        const CodecUtil = require('../../src/CodecUtil')
        let result = await CodecUtil.escapeWithcrlf(`b.tabIndicator.setOnCheckedChangeListener((group, checkedId) -> {
        testController.setEnable(b.reportTest.isChecked());
        bookController.setEnable(b.reportBook.isChecked());
    
        if (b.reportTest.isChecked() && !testController.hasLoadedWebData()
                || b.reportBook.isChecked() && !bookController.hasLoadedWebData()) {
            b.refreshLayout.doRefresh();
        }
    });`)

        assert.equal(result.replace(/ /g,''), `b.tabIndicator.setOnCheckedChangeListener((group,checkedId)-&gt;{&#10;testController.setEnable(b.reportTest.isChecked());&#10;bookController.setEnable(b.reportBook.isChecked());&#10;&#10;if(b.reportTest.isChecked()&amp;&amp;!testController.hasLoadedWebData()&#10;||b.reportBook.isChecked()&amp;&amp;!bookController.hasLoadedWebData()){&#10;b.refreshLayout.doRefresh();&#10;}&#10;});`);
    });
});