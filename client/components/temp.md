<ToggleButtonGroup type='radio' name='options' defaultValue={1} className='toggle-button-group'>
          <ToggleButton id='tb1' value={1} style={{ borderRadius: '14px', color: '#d6fbff' }}>
            Query
          </ToggleButton>
          &nbsp;
          {/* some kind of text area to put in a query */}
          <ToggleButton id='tb2' value={2} style={{ borderRadius: '14px', color: '#d6fbff' }}>
            Mutation
          </ToggleButton>
        </ToggleButtonGroup>

{/_ <div className='query-result-container'>
</div> _/}
