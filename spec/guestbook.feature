Feature: Guestbook

    Comments can be posted to the guestbook application, and I can page through
    those comments in order of the date they were posted.

    Rule: Retrieved comments should be returned in descending order by time

        Example:
            Given I post three comments
            When I retrieve three comments
            Then the comments should be returned in order

    Rule: When I retrieve fewer items than the total set, I should receive a token to fetch more comments
        
        Example:
            Given I post five comments
            When I retrieve three comments
            Then the response should include a continuation token

        Example:
            Given I post five comments
            And I retrieve three comments
            When I retrieve three more comments
            Then the comments should be returned in order
            And I should not receive a continuation token

    Rule: Item retrieval should obey limits in max items

        Example:
            Given I post five comments
            And I retrieve three comments
            When I retrieve one more comment
            Then I should only receive one more comment
